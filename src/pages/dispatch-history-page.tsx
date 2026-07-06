import { motion } from "framer-motion";

import { DispatchOrdersTable } from "@/components/dispatch/dispatch-orders-table";
import { useDispatchStore } from "@/stores/use-dispatch-store";

export function DispatchHistoryPage() {
  const orders = useDispatchStore((state) =>
    state.orders.filter((order) => order.status === "whatsapp_sent" || order.status === "delivered"),
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Dispatch History</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A local record of WhatsApp messages sent from this device.
        </p>
      </div>
      <DispatchOrdersTable orders={orders} emptyText="Sent WhatsApp orders will appear here." />
    </motion.div>
  );
}
