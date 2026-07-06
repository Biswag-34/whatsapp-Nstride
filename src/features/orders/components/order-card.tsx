import { ArrowUpRight, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentBadge } from "@/features/orders/components/payment-badge";
import { StatusBadge } from "@/features/orders/components/status-badge";
import type { Order } from "@/features/orders/types";
import { formatCurrency, formatDate } from "@/features/orders/utils/order-formatters";

interface OrderCardProps {
  order: Order;
  onOpen: (order: Order) => void;
}

export function OrderCard({ order, onOpen }: OrderCardProps) {
  return (
    <Card className="glass-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{order.orderId}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{order.customerName}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <PackageCheck className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{order.product}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.category} • Size {order.size} • Qty {order.quantity}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="font-semibold text-foreground">{formatCurrency(order.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Order Date</p>
          <p className="font-medium text-foreground">{formatDate(order.orderDate)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <PaymentBadge paymentMode={order.paymentMode} />
        <Button type="button" size="sm" variant="outline" onClick={() => onOpen(order)}>
          Details
          <ArrowUpRight />
        </Button>
      </div>
    </Card>
  );
}
