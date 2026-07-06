import { motion } from "framer-motion";

import { DispatchOrdersTable } from "@/components/dispatch/dispatch-orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { useDispatchStore } from "@/stores/use-dispatch-store";

export function DispatchHistoryPage() {
  const orders = useDispatchStore((state) =>
    state.orders.filter(
      (order) =>
        order.status === "whatsapp_sent" ||
        order.status === "delivered" ||
        order.status === "cancelled" ||
        order.status === "rto",
    ),
  );
  const dispatchHistory = useDispatchStore((state) => state.dispatchHistory);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Dispatch History</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A local record of WhatsApp messages sent from this device.
        </p>
      </div>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Order Change Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dispatchHistory.slice(0, 30).map((event) => (
            <div key={event.id} className="grid gap-3 rounded-lg border border-border bg-background/45 p-4 sm:grid-cols-[11rem_1fr]">
              <div className="text-sm text-muted-foreground">{formatDateTime(event.createdAt)}</div>
              <div>
                <p className="text-sm font-semibold">
                  {event.orderId ? `Order #${event.orderId} - ` : ""}
                  {event.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
          {dispatchHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Import and dispatch events will appear here.</p>
          ) : null}
        </CardContent>
      </Card>
      <DispatchOrdersTable orders={orders} emptyText="Sent WhatsApp orders will appear here." />
    </motion.div>
  );
}
