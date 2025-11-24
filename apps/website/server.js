import { createServer } from "http";
import { parse } from "url";
import next from "next";

import { Server } from "socket.io"

import { SensorData } from "db"
import { Connection, ConsumerStatus } from "rabbitmq-client"

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const rabbit = new Connection("amqp://guest:guest@rabbitmq:5672");
let sub;

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true)
        handle(req, res, parsedUrl)
    })

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })

    sub = rabbit.createConsumer({
        queue: 'processed_flow_pressure_data',
        queueOptions: { durable: true },
        exchanges: [{ exchange: 'iot', type: 'topic', durable: true }],
        queueBindings: [{ exchange: "iot", routingKey: 'devices.*.processed_flow_pressure_data' }],
    }, async (msg) => {
        const deviceId = msg.headers?.['x-opt-mqtt-client-id'];
        io.to(deviceId).emit(`data_${deviceId}`, msg.body)

        try {
            const documents = data.map((sample) => ({
                metadata: {
                    deviceId
                },
                timestamp: new Date(sample.timestamp),
                flow: sample.flow,
                pressure: sample.pressure
            }))

            await SensorData.insertMany(documents);
        } catch {
            return ConsumerStatus.REQUEUE
        }

        await Device.findOneAndUpdate({ deviceId }, { lastHeartbeatAt: new Date() });
    })

    sub.on('error', (err) => console.error('consumer error', err))

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        }).listen(port, () => {
            console.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV}`);
        })
});

rabbit.on('error', (err) => console.error('RabbitMQ connection error', err))
rabbit.on('connection', () => console.log('Connection successfully (re)established'))

async function onShutdown() {
    await sub.close()
    await rabbit.close()
}

process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)