import asyncio
import aio_pika
import aio_pika.abc
import torch
import os

leak_threshold = 0.9
model_path = 'leaknet.pt'

def load_model():
    if not os.path.isfile(model_path):
        raise RuntimeError(f"Missing the model file: {model_path}")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = torch.jit.load(model_path, map_location=device)
    model.to(device)
    model.eval()
    
    return model

def predict_sync(data, model):
    data = map(lambda s: [s.pressure, s.flow], data)
    data = torch.tensor(data).unsqueeze(0)
    with torch.inference_mode():
        output = model.predict_step(data).squeeze(0)
    return output.cpu().numpy().tolist()[0]

async def predict(data, model):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, predict_sync, data, model)

async def main(loop):
    connection: aio_pika.abc.AbstractRobustConnection = await aio_pika.connect_robust(
        "amqp://guest:guest@rabbitmq/", loop=loop
    )
    
    model = load_model()

    async with connection:
        
        # Creating channel
        channel: aio_pika.abc.AbstractChannel = await connection.channel()
        
        # connect to MQTT exchange and read from queue
        data_queue = await channel.declare_queue("inference_data", auto_delete=True)
        iot_exchange = await channel.declare_exchange("iot", aio_pika.ExchangeType.TOPIC, durable=True)
        await data_queue.bind(exchange=iot_exchange, routing_key="devices.*.processed_flow_pressure_data")
        
        async with data_queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    try:
                        
                        input_data = message.body.decode()
                        result = await predict(input_data, model)
                        
                        if result > leak_threshold:
                            await iot_exchange.publish(
                                aio_pika.Message(
                                    headers={
                                        "x-opt-mqtt-client-id": message.headers.get("x-opt-mqtt-client-id")
                                    }),
                                routing_key="leak_detected"
                            )
                            
                    except Exception as e:
                        print(f"Error processing message: {e}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(loop))
    loop.close()