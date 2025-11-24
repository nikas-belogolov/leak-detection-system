'use client';
import { startTransition, useEffect, useEffectEvent, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button, buttonVariants } from "~/components/ui/button";
import { CSVLink } from "react-csv";
import { Input } from "~/components/ui/input";
import { useSocket } from "~/context/SocketContext";

import { Line } from "react-chartjs-2";

export default function Chart({ deviceId }: { deviceId: any }) {

    const io = useSocket();

    const [chartData, setChartData] = useState([] as any[]);
    const [csvFileName, setCsvFileName] = useState("")

    function reset() {
        setChartData([])
        setCsvFileName("")
    }

    useEffect(() => {
        console.log(deviceId)
        function update(data: any) {
            console.log(data)
            startTransition(() => {
                setChartData(previous => [...previous, ...data]);
            })
        }

        io.on(`data_${deviceId}`, update);

        return () => {
            io.off(`data_${deviceId}`, update);
        }
    }, [io, deviceId])

    const data = {
        labels: chartData.map((d) => d.timestamp),
        datasets: [
            {
                label: "Flow",
                data: chartData.map((d) => d.flow),
                borderColor: "blue",
                // backgroundColor: "hsla(blue, 0.3)",
                tension: 0.3,
                pointRadius: 0,
            },
            {
                label: "Pressure",
                data: chartData.map((d) => d.pressure),
                borderColor: "red",
                // backgroundColor: "hsla(var(--chart-2), 0.3)",
                tension: 0.3,
                pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false as const,
        scales: {
            x: {
                type: "time" as const,
                time: {
                    tooltipFormat: "HH:mm:ss",
                    displayFormats: { second: "HH:mm:ss" },
                },
                grid: { display: false },
                ticks: {
                    color: "hsl(var(--foreground))",
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
            },
            y: {
                grid: { color: "rgba(0,0,0,0.1)" },
                ticks: {
                    color: "hsl(var(--foreground))",
                },
            },
        },
        plugins: {
            legend: {
                position: "top" as const,
            },
            tooltip: {
                mode: "index" as const,
                intersect: false,
            },
        },
    };

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>Sensor Readings</CardTitle>
                <CardDescription>Updated live</CardDescription>
            </CardHeader>
            <CardContent className="relative h-full">
                <Line data={data} options={options} />
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <Input onChange={(e) => setCsvFileName(e.target.value)} value={csvFileName} placeholder="CSV Name" />
                    <CSVLink suppressHydrationWarning filename={`${csvFileName}.csv`} className={buttonVariants({ variant: "default", size: "default" })} data={chartData}>Download CSV</CSVLink>
                    <Button onClick={reset}>Reset</Button>
                </div>
            </CardFooter>
        </Card>
    )
}