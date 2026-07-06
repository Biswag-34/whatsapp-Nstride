import { motion } from "framer-motion";
import {
  Banknote,
  BellDot,
  CheckCircle2,
  Clock3,
  PackageCheck,
  PackageX,
  UploadCloud,
  WalletCards,
} from "lucide-react";

import { MetricCard } from "@/components/dispatch/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useDispatchStore } from "@/stores/use-dispatch-store";

export function DashboardPage() {
  const metrics = useDispatchStore((state) => state.metrics);
  const activities = useDispatchStore((state) => state.activities);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">N-Stride Dispatch Center</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">
          Dispatch operations
        </h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={PackageCheck} label="Total Orders" value={metrics.totalOrders} />
        <MetricCard icon={BellDot} label="Pending WhatsApp" tone="amber" value={metrics.pendingWhatsApp} />
        <MetricCard icon={CheckCircle2} label="WhatsApp Sent" tone="emerald" value={metrics.whatsappSent} />
        <MetricCard icon={PackageX} label="Cancelled" tone="slate" value={metrics.cancelled} />
        <MetricCard icon={Clock3} label="Delivered" value={metrics.delivered} />
        <MetricCard icon={Banknote} label="COD" tone="amber" value={metrics.cod} />
        <MetricCard icon={WalletCards} label="Prepaid" tone="emerald" value={metrics.prepaid} />
        <MetricCard icon={UploadCloud} label="Today's Import" value={metrics.todayImport} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Latest Import Session</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.latestImportSession ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{metrics.latestImportSession.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(metrics.latestImportSession.importedAt)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="rounded-lg bg-muted/60 p-3">Inserted: {metrics.latestImportSession.inserted}</span>
                  <span className="rounded-lg bg-muted/60 p-3">Updated: {metrics.latestImportSession.updated}</span>
                  <span className="rounded-lg bg-muted/60 p-3">Duplicates: {metrics.latestImportSession.duplicates}</span>
                  <span className="rounded-lg bg-muted/60 p-3">Errors: {metrics.latestImportSession.errors}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                No Shopdeck file has been imported yet.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.slice(0, 6).map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border bg-background/45 p-3">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Activity will appear after imports or WhatsApp dispatches.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
