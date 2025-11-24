'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

import ESPProvisioner, { Security1, IWiFiScanResult } from "esp-ble-prov"
import { useEffect, useRef, useState } from "react"

import { toast } from "sonner"

import { addDevice } from "~/lib/actions"

interface AddDeviceDialogProps {
    open: boolean;
    setOpen: (isOpen: boolean) => void;
}

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export default function AddDeviceDialog({ open, setOpen }: AddDeviceDialogProps) {

    const provisionerRef = useRef<ESPProvisioner>(
        new ESPProvisioner({
            deviceNamePrefix: "Irrigo",
            serviceUUID: "021a9004-0382-4aea-bff4-6b3f1c5adfb4",
            security: new Security1()
        })
    )

    const [deviceName, setDeviceName] = useState<string | null>("");
    const [networks, setNetworks] = useState<IWiFiScanResult[]>([]);
    const [network, setNetwork] = useState<IWiFiScanResult | null>(null);
    const [passphrase, setPassphrase] = useState<string>("");

    useEffect(() => {

        const device = provisionerRef.current.device;

        function onDeviceDisconnect() {
            resetProvisioningState();
            toast.info("Device disconnected.");
        }

        device?.addEventListener("gattserverdisconnected", onDeviceDisconnect)
        return () => device?.removeEventListener('gattserverdisconnected', onDeviceDisconnect)
    }, [])

    useEffect(() => {
        if (open == true) {
            resetProvisioningState();
        }
    }, [open])

    const selectDevice = async () => {
        if (!provisionerRef.current) return;
        const provisioner = provisionerRef.current;

        try {
            if (provisioner.isConnected) {
                await provisioner.disconnect();
                resetProvisioningState();
            }
            await provisioner.connect();
            await provisioner.establishSession();

            setDeviceName(provisioner.device?.name!);

            toast.promise(provisioner.scan(), {
                loading: "Scanning for WiFi networks...",
                success: (networks) => {
                    setNetworks(networks)
                    return `Found ${networks.length} WiFi networks.`
                },
                error: "Failed to scan for WiFi networks."
            })
        } catch (e) {
            toast.error(`Failed to connect to device. (${e})`);
        }
    }

    async function pairDevice() {
        // Add device to DB
        if (!provisionerRef.current ||
            !network ||
            passphrase.length == 0 ||
            !deviceName ||
            deviceName?.length == 0) return;

        const { ssid, bssid, channel } = network;

        const provisioner = provisionerRef.current

        try {
            await provisioner.writeValueToEndpoint("device-id", textEncoder.encode("test"));
            let deviceId = await provisioner.readValueFromEndpoint("device-id").then(value => textDecoder.decode(value));
            console.log("Device ID: ", deviceId);

            await provisioner.sendCredentials({
                ssid,
                passphrase: textEncoder.encode(passphrase),
                bssid,
                channel
            }).then(async () => {
                
                const response = await addDevice({
                    deviceId,
                    deviceName
                })

                console.log(response)

                if (response?.success) {
                    toast.success("Successfully connected device to WiFi.");
                    setOpen(false)
                } else {
                    toast.error(`Failed to connect device to WiFi.`);
                    setPassphrase("");
                }
            })
        } catch (e) {
            console.log(e)
            toast.error(`Failed to connect device to WiFi.`);
            setPassphrase("");
        }
    }

    const resetProvisioningState = () => {
        setPassphrase("")
        setNetworks([]);
        setNetwork(null);
        setDeviceName(null);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Device</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="ssid">Device</Label>
                        <Button variant="outline" onClick={selectDevice}>{deviceName != null ? deviceName : "Select Device"}</Button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="ssid">
                            WiFi Network
                        </Label>
                        <Select name="ssid" onValueChange={(value) => setNetwork(networks[parseInt(value)])} disabled={networks.length === 0}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your network" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {networks?.map((network, i) => {
                                        return (
                                            <SelectItem value={i.toString()} key={i}>
                                                {textDecoder.decode(network.ssid!)}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="password">
                            Password
                        </Label>
                        <Input id="password" onChange={(e) => setPassphrase(e.target.value)} disabled={networks.length === 0} value={passphrase} />
                    </div>
                </div>
                <DialogFooter>
                    <Button disabled={network == null || passphrase == ""} onClick={pairDevice}>Pair Device</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}