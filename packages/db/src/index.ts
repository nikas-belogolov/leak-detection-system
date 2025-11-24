import mongoose from "mongoose";
const { MONGODB_URI, MONGODB_DB } = process.env;

export { type IDevice, Device } from "./models/device.js"
export { SensorData } from "./models/sensor_data.js"
export { type IUser, User } from "./models/user.js"

declare global {
    var _mongoose: {
        conn: mongoose.Mongoose | null
        promise: Promise<mongoose.Mongoose> | null
    };
}

let cached = global._mongoose;

if (!cached) {
    cached = global._mongoose = { conn: null, promise: null };
}

mongoose.set('transactionAsyncLocalStorage', true)
mongoose.SchemaTypes.ObjectId.get(v => v.toString())
mongoose.set('toJSON', { getters: true });

export async function dbConnect() {

    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build") {
        console.warn("Skipping DB connection during build phase.");
        return null;
    }

    if (!MONGODB_URI) {
        throw new Error(
            "Please define the MONGODB_URI environment variable inside .env.local",
        );
    }

    if (!MONGODB_DB) {
        throw new Error(
            'Please define the MONGODB_DB environment variable inside .env.local'
        )
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            dbName: MONGODB_DB
        }).then(mongoose => mongoose)
    }

    cached.conn = await cached.promise;
    console.log("Connected to DB")

    return cached.conn;
}

export async function getMongoDbClient() {
    const mongooseClient = await dbConnect();

    const client = mongooseClient?.connection.getClient()

    return { client, db: client?.db(MONGODB_DB) };
}

