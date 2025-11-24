import mongoose from "mongoose";

const schema =  new mongoose.Schema(
    {
        timestamp: Date,
        pressure: Number,
        flow: Number,
        metadata: {
            deviceId: String,
        }
    }, {
    timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'seconds'
    },
    collection: "sensor_data",
});

schema.set('validateBeforeSave', false);

export const SensorData = mongoose.models.SensorData || mongoose.model("SensorData", schema);
