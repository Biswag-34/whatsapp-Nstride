import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { OrderChart } from "@/components/dashboard/order-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { metrics } from "@/features/dashboard/data/mock-dashboard";

export function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <section className="glass-panel rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge variant="success" className="mb-4">
              Healthcare operations
            </Badge>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              N-Stride Command Center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Comfort • Protection • Every Step Matters
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <CalendarDays />
              Today
            </Button>
            <Button>
              Operations brief
              <ArrowUpRight />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} index={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <OrderChart />
        <QuickActions />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(320px,0.48fr)]">
        <RecentActivity />
        <div className="glass-panel rounded-xl border border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-normal text-foreground">
              Dispatch Health
            </h2>
            <Badge variant="slate">North zone</Badge>
          </div>
          <div className="mt-6 space-y-5">
            {[
              ["Protected stock", "87%"],
              ["Courier SLA", "94%"],
              ["Payment captured", "91%"],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
