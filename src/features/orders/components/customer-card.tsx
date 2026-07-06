import { MapPin, Phone, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/features/orders/types";

interface CustomerCardProps {
  order: Order;
}

export function CustomerCard({ order }: CustomerCardProps) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4 text-primary" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Name</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{order.customerName}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <Phone className="size-3.5" />
              Phone
            </p>
            <p className="mt-1 text-sm text-foreground">{order.mobileNumber}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">PIN Code</p>
            <p className="mt-1 text-sm text-foreground">{order.pinCode}</p>
          </div>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
            <MapPin className="size-3.5" />
            Address
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">{order.address}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">City</p>
            <p className="mt-1 text-sm text-foreground">{order.city}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">State</p>
            <p className="mt-1 text-sm text-foreground">{order.state}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
