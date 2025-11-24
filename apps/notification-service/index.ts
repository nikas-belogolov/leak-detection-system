import { Connection, ConsumerStatus } from "rabbitmq-client";
import nodemailer from "nodemailer"
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import dayjs from "dayjs";
import { fromEnv } from "@aws-sdk/credential-providers"
import { Device } from "db"
import type { IUser } from "db"

const sesClient = new SESv2Client({
    region: process.env.AWS_REGION,
    credentials: fromEnv()
});

let transporter = nodemailer.createTransport({
    SES: { sesClient, SendEmailCommand },
});

const rabbit = new Connection("amqp://guest:guest@rabbitmq:5672");

const sub = rabbit.createConsumer({
    queue: 'notify_email',
    queueOptions: { durable: true },
    exchanges: [{ exchange: 'iot', type: 'topic', durable: true }],
    queueBindings: [{ exchange: 'iot', routingKey: 'leak_detected' }],
}, async (msg) => {

    try {
        const deviceId = msg.headers?.['x-opt-mqtt-client-id'];

        const device = await Device.findOne({ deviceId }).populate < { owner: IUser } > ('owner', 'email').exec();

        if (!device) {
            console.log(`Device not found for ID: ${deviceId}`);
            return ConsumerStatus.ACK;
        }

        // If last leak alert is older than 1 hour
        if (dayjs(device.lastLeakAlertAt).isAfter(dayjs().subtract(1, 'hour'))) {
            return ConsumerStatus.ACK;
        }

        device.lastLeakAlertAt = new Date()
        await device.save()
        
        await transporter.sendMail({
            from: "alerts@irrigo.xyz",
            to: device.owner.email,
            subject: "Leak Detected",
            text: `A leak was detected on your irrigation system at ${dayjs().format('YYYY-MM-DD HH:mm:ss')}. Please check your system immediately.`,
        });

    } catch (error) {
        return ConsumerStatus.REQUEUE;
    }
})

sub.on('error', (err) => console.error('consumer error', err))
rabbit.on('error', (err) => console.error('RabbitMQ connection error', err))
rabbit.on('connection', () => console.log('Connection successfully (re)established'))

async function onShutdown() {
    await sub.close();
    await rabbit.close();
}

process.on("SIGINT", onShutdown)
process.on("SIGTERM", onShutdown)