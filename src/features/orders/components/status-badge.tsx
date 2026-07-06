import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/features/orders/types";

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusStyles: Record<OrderStatus, string> = {
  Pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  New: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-200",
  Confirmed:
    "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200",
  "WhatsApp Sent":
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  Dispatched:
    "border-primary/20 bg-primary/10 text-primary dark:text-emerald-100",
  Delivered:
    "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-200",
  Cancelled: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge className={cn("whitespace-nowrap", statusStyles[status])}>{status}</Badge>;
}
