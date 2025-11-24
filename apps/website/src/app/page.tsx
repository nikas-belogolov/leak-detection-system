
import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

function StatisticCard({ title, value, className }: { title: string; value: string; className?: string }) {
  return (
    <div className={"absolute bg-blue-50/80 p-5 rounded-2xl shadow-lg border border-blue-50/50 hover:rotate-0 duration-300 " + className}>
      <div className="text-center">
        <div className="text-3xl text-primary font-bold mb-2">{value}</div>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen">

      <header className="border-b bg-background/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center" >
            <div className="relative" style={{ width: 32, height: 32 }}>
              <Image src="leaknet-logo.svg" alt="logo" fill={true} />
            </div>
            <span className="text-xl font-medium">Irrigo</span>
          </div>
          <nav>
            <Link href="/auth/login" className="p-5 text-sm font-medium hover:underline">
              Login
            </Link>
            <Link href="/auth/signup" className="p-5 text-sm font-medium hover:underline">
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <section className="py-40 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl mb-6 text-foreground">
                Intelligent Leak Detection for Your Garden
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Advanced IoT device that detect water leaks in real-time, preventing costly damage
                and giving you peace of mind with 24/7 monitoring and instant alerts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* <Button size="lg" onClick={onNavigateToDashboard}>
                  View Live Dashboard
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button> */}
              </div>
            </div>
            <div className="relative min-h-[400px] flex items-center justify-center">
              {/* Floating Cloud Stats */}
              <div className="relative w-full max-w-md">

                <StatisticCard title="Detection Accuracy" value="99.9%" className="top-0 left-0 -rotate-3" />
                <StatisticCard title="Alert Response Time" value="&lt;30s" className="top-12 right-0 rotate-2" />
                <StatisticCard title="Monitoring Uptime" value="24/7" className="bottom-0 left-1/2 rotate-1 -translate-x-1/4" />

                {/* Soft background cloud effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-full blur-3xl -z-10 scale-150"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-cyan-50/20 to-blue-50/20 rounded-full blur-2xl -z-10 scale-125 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl mb-4">
              Comprehensive Leak Protection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our device provides complete coverage with advanced features designed
              to protect your garden from water damage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                {/* <Shield className="h-10 w-10 text-primary mb-2" /> */}
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>
                  Continuous 24/7 monitoring with instant detection of water leaks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                {/* <Bell className="h-10 w-10 text-primary mb-2" /> */}
                <CardTitle>Instant Alerts</CardTitle>
                <CardDescription>
                  Immediate notifications via {/*mobile app*/} email {/*, and SMS*/} when leaks are detected
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                {/* <Wifi className="h-10 w-10 text-primary mb-2" /> */}
                <CardTitle>Wireless Connectivity</CardTitle>
                <CardDescription>
                  Easy setup with WiFi connectivity and long-lasting battery life
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl mb-4">
            Ready to Protect Your Garden?
          </h2>
          <a href="/auth/signup">
            Start Monitoring Now
          </a>
        </div>
      </section>

      <footer className="py-8 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative" style={{ width: 32, height: 32 }}>
                <Image src="leaknet-logo.svg" alt="logo" fill={true} />
              </div>
              <span className="font-medium">Irrigo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Irrigo IoT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
