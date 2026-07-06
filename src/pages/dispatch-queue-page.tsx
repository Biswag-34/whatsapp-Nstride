import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { DispatchOrdersTable } from "@/components/dispatch/dispatch-orders-table";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/features/dispatch/services/template-engine";
import type { DispatchOrder } from "@/features/dispatch/types";
import { useDispatchStore } from "@/stores/use-dispatch-store";

export function DispatchQueuePage() {
  const queueOrders = useDispatchStore((state) =>
    state.orders.filter(
      (order) => order.status === "pending_dispatch" || order.status === "whatsapp_ready",
    ),
  );
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [courierFilter, setCourierFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const template = useDispatchStore(
    (state) => state.templates.find((item) => item.isDefault) ?? state.templates[0],
  );
  const markWhatsAppSent = useDispatchStore((state) => state.markWhatsAppSent);
  const orders = useMemo(
    () =>
      queueOrders.filter((order) => {
        const matchesPayment = paymentFilter === "all" || order.paymentType === paymentFilter;
        const matchesCourier =
          !courierFilter || order.courier.toLowerCase().includes(courierFilter.toLowerCase());
        const matchesCity = !cityFilter || order.city.toLowerCase().includes(cityFilter.toLowerCase());
        const matchesState =
          !stateFilter || order.state.toLowerCase().includes(stateFilter.toLowerCase());
        const matchesDate = !dateFilter || order.orderDate.slice(0, 10) === dateFilter;

        return matchesPayment && matchesCourier && matchesCity && matchesState && matchesDate;
      }),
    [cityFilter, courierFilter, dateFilter, paymentFilter, queueOrders, stateFilter],
  );

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
      <div className="grid gap-3 rounded-xl border border-border bg-card/70 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <select
          className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
        >
          <option value="all">All Payments</option>
          <option value="COD">COD</option>
          <option value="Prepaid">Prepaid</option>
        </select>
        <input
          className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Courier"
          value={courierFilter}
          onChange={(event) => setCourierFilter(event.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="City"
          value={cityFilter}
          onChange={(event) => setCityFilter(event.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="State"
          value={stateFilter}
          onChange={(event) => setStateFilter(event.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
        />
      </div>
      <DispatchOrdersTable
        orders={orders}
        emptyText="No pending WhatsApp orders."
        onSendWhatsApp={sendWhatsApp}
      />
    </motion.div>
  );
}
