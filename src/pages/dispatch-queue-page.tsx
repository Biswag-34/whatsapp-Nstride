import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

import { DispatchOrdersTable } from "@/components/dispatch/dispatch-orders-table";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/features/dispatch/services/template-engine";
import type { DispatchOrder } from "@/features/dispatch/types";
import { useDispatchStore } from "@/stores/use-dispatch-store";

export function DispatchQueuePage() {
  const orders = useDispatchStore((state) =>
    state.orders.filter((order) => order.status === "pending_whatsapp"),
  );
  const template = useDispatchStore(
    (state) => state.templates.find((item) => item.isDefault) ?? state.templates[0],
  );
  const markWhatsAppSent = useDispatchStore((state) => state.markWhatsAppSent);

  function sendWhatsApp(order: DispatchOrder) {
    window.open(getWhatsAppUrl(order, template.body), "_blank", "noopener,noreferrer");
    void markWhatsAppSent([order.id]);
  }

  function sendNext() {
    const next = orders[0];

    if (next) {
      sendWhatsApp(next);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Dispatch Queue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders waiting for WhatsApp dispatch confirmation.
          </p>
        </div>
        <Button onClick={sendNext} disabled={orders.length === 0}>
          <MessageCircle />
          Send Next WhatsApp
        </Button>
      </div>
      <DispatchOrdersTable
        orders={orders}
        emptyText="No pending WhatsApp orders."
        onSendWhatsApp={sendWhatsApp}
      />
    </motion.div>
  );
}
