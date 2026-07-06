import { ExternalLink, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/features/orders/types";
import { formatDate } from "@/features/orders/utils/order-formatters";

interface ShippingCardProps {
  order: Order;
}

export function ShippingCard({ order }: ShippingCardProps) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-4 text-primary" />
          Shipping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Courier</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{order.courier}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Tracking Number
            </p>
            <p className="mt-1 text-sm text-foreground">{order.trackingId}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Dispatch Date
            </p>
            <p className="mt-1 text-sm text-foreground">{formatDate(order.dispatchDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Expected Delivery
            </p>
            <p className="mt-1 text-sm text-foreground">
              {formatDate(order.expectedDelivery)}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={order.trackingUrl} target="_blank" rel="noreferrer">
            Tracking URL
            <ExternalLink />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
