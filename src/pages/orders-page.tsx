import { motion } from "framer-motion";
import { PackageCheck, Send, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { NewOrderDialog } from "@/features/orders/components/new-order-dialog";
import { OrderDrawer } from "@/features/orders/components/order-drawer";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { StatusBadge } from "@/features/orders/components/status-badge";
import { formatCurrency } from "@/features/orders/utils/order-formatters";
import { cn } from "@/lib/utils";
import { useOrdersStore } from "@/stores/use-orders-store";

function OrdersStatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  icon: typeof ShoppingBag;
  tone: string;
}) {
  return (
    <div className="glass-panel rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
        </div>
        <div className={cn("rounded-xl p-2.5", tone)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const orders = useOrdersStore((state) => state.orders);
  const selectedOrderId = useOrdersStore((state) => state.selectedOrderId);
  const selectOrder = useOrdersStore((state) => state.selectOrder);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 650);

    return () => window.clearTimeout(timeout);
  }, []);

  const stats = useMemo(() => {
    const dispatched = orders.filter((order) => order.status === "Dispatched").length;
    const whatsappSent = orders.filter((order) => order.status === "WhatsApp Sent").length;
    const totalRevenue = orders.reduce((total, order) => total + order.total, 0);

    return [
      {
        label: "Total Orders",
        value: String(orders.length),
        caption: "Persisted local records",
        icon: ShoppingBag,
        tone: "bg-primary/10 text-primary",
      },
      {
        label: "Dispatched",
        value: String(dispatched),
        caption: "Moved to courier",
        icon: Truck,
        tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
      },
      {
        label: "WhatsApp Sent",
        value: String(whatsappSent),
        caption: "Customer updates sent",
        icon: Send,
        tone: "bg-sky-500/10 text-sky-700 dark:text-sky-200",
      },
      {
        label: "Order Value",
        value: formatCurrency(totalRevenue),
        caption: "Mock gross total",
        icon: PackageCheck,
        tone: "bg-slate-900/10 text-slate-800 dark:bg-white/10 dark:text-slate-100",
      },
    ];
  }, [orders]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      <section className="glass-panel rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge status="Dispatched" />
              <span className="text-sm text-muted-foreground">Core CRM module</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              Orders
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage healthcare product orders, shipping status, customer records, WhatsApp
              follow-ups, and local operational data from one command surface.
            </p>
          </div>
          <NewOrderDialog />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <OrdersStatCard key={stat.label} {...stat} />
        ))}
      </section>

      <OrdersTable
        orders={orders}
        isLoading={isLoading}
        onOpenOrder={(order) => selectOrder(order.id)}
      />

      <OrderDrawer
        order={selectedOrder}
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) {
            selectOrder(null);
          }
        }}
      />
    </motion.div>
  );
}
