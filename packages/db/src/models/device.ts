import mongoose, { Schema, Model } from "mongoose";

type AlertType = "warning" | "critical"
type Alert = { type: AlertType, message: string }

export interface IDevice extends mongoose.Document {
    owner: mongoose.Types.ObjectId;
    deviceId: string;
    name?: string;
    lastHeartbeatAt: Date;
    lastLeakAlertAt: Date;
    alerts: [Alert]
}

const schema = new Schema<IDevice>({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deviceId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: false,
        trim: true
    },
    lastHeartbeatAt: {
        type: Date,
        default: new Date(),
    },
    lastLeakAlertAt: {
        type: Date,
        default: new Date(0)
    },
})

schema.set('validateBeforeSave', false);

const Device = mongoose.models.Device as mongoose.Model<IDevice> || mongoose.model<IDevice>("Device", schema);

export { Device }
