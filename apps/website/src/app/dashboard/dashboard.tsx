'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import DeviceTab from "~/app/dashboard/_components/DeviceTab";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Droplets, Plus } from "lucide-react";
import { FaTrash } from "react-icons/fa";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AddDeviceDialog from "./_components/AddDeviceDialog";
import { SocketContext } from "~/context/SocketContext";
import socketIOClient, { Socket } from "socket.io-client"
import { deleteDevice } from "~/lib/actions";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Dashboard({ devices }: { devices: any[] }) {
    const router = useRouter();
    const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false);

    const socketIoRef = useRef(socketIOClient({
        withCredentials: true,
        auth: {
            devices: devices.map(device => device._id)
        }
    }))

    async function handleDeleteDevice(deviceId: string) {
        const { message, success } = await deleteDevice({ deviceId })

        if (success) {
            toast.success(message)
        } else {
            toast.error(message)
        }
    }

    async function handleLogout() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/auth/login");
                },
            }
        })
    }

    return (
        <SocketContext value={socketIoRef.current}>

            <AddDeviceDialog open={showAddDeviceDialog} setOpen={setShowAddDeviceDialog} />

            <div className="h-screen flex flex-col">
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative" style={{ width: 32, height: 32 }}>
                                        <Image src="leaknet-logo.svg" alt="logo" fill={true} />
                                    </div>
                                    <span className="text-lg font-medium">Dashboard</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setShowAddDeviceDialog(true)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Device
                                </Button>
                                <Button onClick={handleLogout}>Log out</Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto py-8 px-2 grow-[1]">
                    {devices.length == 0 ? (
                        <p>No devices. Start by adding a device.</p>
                    ) : (
                        <Tabs>
                            <TabsList className="w-full grid grid-cols-1 md:grid-cols-3 gap-2 bg-accent p-2 h-auto">
                                {
                                    devices.map(device => {
                                        return (
                                            <TabsTrigger value={device._id} key={device._id}>
                                                {device.name}
                                                <span onClick={() => handleDeleteDevice(device._id)}>
                                                    <FaTrash />
                                                </span>
                                            </TabsTrigger>
                                        )
                                    })
                                }
                            </TabsList>
                            {
                                devices.map(device => {
                                    return (
                                        <TabsContent value={device._id} key={device._id}>
                                            <DeviceTab device={device} />
                                        </TabsContent>
                                    )
                                })
                            }
                        </Tabs>
                    )}
                </div>
            </div>
        </SocketContext>
    );
}