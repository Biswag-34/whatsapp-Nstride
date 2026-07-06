import { ArrowUpRight, MapPin, Phone, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CustomerProfile } from "@/features/customers/types";
import { formatCurrency, formatDate } from "@/features/orders/utils/order-formatters";

interface CustomerCardProps {
  customer: CustomerProfile;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Card className="glass-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-normal text-foreground">
            {customer.customerName}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="size-3.5" />
            {customer.phoneNumber}
          </p>
        </div>
        <Badge variant={customer.whatsappStatus === "Sent" ? "success" : "warning"}>
          {customer.whatsappStatus}
        </Badge>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl bg-background/55 p-3 dark:bg-white/[0.03]">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {customer.address}, {customer.city}, {customer.state}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{customer.totalOrders}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {formatCurrency(customer.totalRevenue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Preferred</p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {customer.preferredProduct}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last Order</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {formatDate(customer.lastOrderDate)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {customer.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="slate">
            {tag}
          </Badge>
        ))}
      </div>

      <Button asChild type="button" variant="outline" className="mt-4 w-full">
        <Link to={`/customers/${customer.id}`}>
          <ShoppingBag />
          View Profile
          <ArrowUpRight />
        </Link>
      </Button>
    </Card>
  );
}
