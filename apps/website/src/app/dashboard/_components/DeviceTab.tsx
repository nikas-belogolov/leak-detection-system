'use client';

import { useEffect } from "react";
import Chart from "./Chart";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Battery, Heart } from "lucide-react";
import { IDevice } from "db";

export default function DeviceTab({ device }: { device: IDevice }) {

    return (
        <div className="h-full">
            <Card>
                <CardHeader className='text-sm flex items-center justify-between'>
                    <CardTitle>Device Last Heartbeat</CardTitle>
                    <CardContent>{new Date(device.lastHeartbeatAt).toLocaleTimeString("en-US")}</CardContent>
                    <Heart size={15} />
                </CardHeader>
            </Card>
            <Chart deviceId={device._id} />
        </div>
    )
}