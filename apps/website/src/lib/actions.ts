'use server';

import { auth } from "./auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import mongoose from "mongoose"
import { User, Device, dbConnect } from "db";

await dbConnect()

async function ensureAuthenticated() {
    let userSession = await auth.api.getSession({ headers: await headers() });
    if (!userSession) throw new Error("Not authenticated.")
    return userSession;
}

type addDeviceActionProps = {
    deviceName: string;
    deviceId: string;
}

export async function addDevice({ deviceName, deviceId }: addDeviceActionProps) {
    try {
        const { user } = await ensureAuthenticated();

        await mongoose.connection.transaction(async () => {
            const device = await Device.findOneAndUpdate(
                { deviceId },
                {
                    $setOnInsert: {
                        deviceId,
                        name: deviceName,
                        owner: user.id
                    }
                },
                { upsert: true, new: true }
            ).exec();

            await User.findOneAndUpdate(
                { _id: user.id },
                { $addToSet: { devices: device.id } },
            ).exec()
        })

        revalidatePath('/dashboard');
    } catch (e) {
        console.error(e)
        return { message: "Failed to add device.", success: false }
    }

    return { message: "Successfully added device.", success: true }
}

type deleteDeviceActionProps = {
    deviceId: string;
}

export async function deleteDevice({ deviceId }: deleteDeviceActionProps) {
    try {
        const { user } = await ensureAuthenticated();

        await mongoose.connection.transaction(async () => {
            await Device.deleteOne({ deviceId }).exec()

            await User.findOneAndUpdate(
                { _id: user.id },
                { $pull: { devices: deviceId } },
            ).exec()
        })

        revalidatePath('/dashboard');
    } catch (e) {
        console.error(e)
        return { message: "Failed to delete device.", success: false }
    }

    return { message: "Successfully deleted device.", success: true }
}

export async function getLeakAlerts() {

}



