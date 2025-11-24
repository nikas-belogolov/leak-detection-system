
import process from "node:process";
import { Connection } from "rabbitmq-client";
import protobuf from "protobufjs";
import Long from "long";

// Configure protobuf
protobuf.util.Long = Long;
protobuf.configure();
const protoRoot = await protobuf.load("./sample_batch.proto");
const SampleBatch = protoRoot.lookupType("SampleBatch");

const rabbit = new Connection("amqp://guest:guest@rabbitmq:5672");

rabbit.on('error', (err) => {
  console.log('RabbitMQ connection error', err)
})
rabbit.on('connection', () => {
  console.log('Connection successfully (re)established')
})

const publisher = rabbit.createPublisher({
  exchanges: [{exchange: 'iot', type: 'topic'}],
});

const rawDataConsumer = rabbit.createConsumer({
  queue: 'devices.*.flow_pressure_data',
  queueOptions: {durable: true},
  qos: {prefetchCount: 1},
  exchanges: [{exchange: 'mqtt', type: 'topic'}],
  queueBindings: [{exchange: 'mqtt', routingKey: 'devices.*.flow_pressure_data'}],
}, async (msg) => {

  const payload = new Uint8Array(msg.body);
  let message = SampleBatch.decode(payload);
  let data = SampleBatch.toObject(message, {
      longs: Number,
      defaults: true,
  });

  publisher.send({
    exchange: "iot",
    routingKey: "devices.*.processed_flow_pressure_data",
    headers: msg.headers
  }, msg.body.toString('utf8'))
})

rawDataConsumer.on('error', (err) => {
  console.log('consumer error (user-events)', err)
})

async function onShutdown() {
  await publisher.close()
  await rawDataConsumer.close()
  await rabbit.close()
}
process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)