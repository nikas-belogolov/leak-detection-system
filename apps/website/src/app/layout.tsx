import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "LeakGuard IoT - Intelligent Leak Detection for Your Garden",

  description: "Advanced IoT technology that detects water leaks in real-time, preventing costly damage and giving you peace of mind with 24/7 monitoring and instant alerts.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
