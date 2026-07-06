import { Crown, Repeat2, TrendingUp, UserPlus } from "lucide-react";

import type { CustomerProfile } from "@/features/customers/types";
import { formatCurrency } from "@/features/orders/utils/order-formatters";
import { cn } from "@/lib/utils";

interface CustomerDashboardWidgetsProps {
  customers: CustomerProfile[];
}

export function CustomerDashboardWidgets({ customers }: CustomerDashboardWidgetsProps) {
  const repeatCustomers = customers.filter((customer) => customer.totalOrders > 1).length;
  const repeatRate =
    customers.length > 0 ? Math.round((repeatCustomers / customers.length) * 100) : 0;
  const highestRevenue = [...customers].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  const mostActive = [...customers].sort((a, b) => b.totalOrders - a.totalOrders)[0];
  const newCustomers = customers.filter((customer) => customer.totalOrders === 1).length;
  const cards = [
    {
      label: "Top Customers",
      value: highestRevenue?.customerName ?? "None",
      caption: highestRevenue ? formatCurrency(highestRevenue.totalRevenue) : "No revenue yet",
      icon: Crown,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Most Active",
      value: mostActive?.customerName ?? "None",
      caption: mostActive ? `${mostActive.totalOrders} orders` : "No orders yet",
      icon: TrendingUp,
      tone: "bg-sky-500/10 text-sky-700 dark:text-sky-200",
    },
    {
      label: "New Customers",
      value: String(newCustomers),
      caption: "First-order profiles",
      icon: UserPlus,
      tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
    },
    {
      label: "Repeat Purchase Rate",
      value: `${repeatRate}%`,
      caption: `${repeatCustomers} repeat customers`,
      icon: Repeat2,
      tone: "bg-slate-900/10 text-slate-800 dark:bg-white/10 dark:text-slate-100",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.label} className="glass-panel rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2 truncate text-xl font-semibold tracking-normal text-foreground">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{card.caption}</p>
              </div>
              <div className={cn("rounded-xl p-2.5", card.tone)}>
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
