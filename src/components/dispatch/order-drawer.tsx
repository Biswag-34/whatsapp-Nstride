import { MessageCircle, PackageCheck } from "lucide-react";

import { PaymentPill, StatusPill } from "@/components/dispatch/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { getOrderVariant, getSourceValue, getWhatsAppStatus } from "@/features/dispatch/services/operations";
import type { DispatchOrder } from "@/features/dispatch/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface OrderDrawerProps {
  onOpenChange: (open: boolean) => void;
  onSendWhatsApp?: (order: DispatchOrder) => void;
  open: boolean;
  order?: DispatchOrder;
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-medium">{value || "Not set"}</span>
    </div>
  );
}

export function OrderDrawer({ onOpenChange, onSendWhatsApp, open, order }: OrderDrawerProps) {
  if (!order) {
    return <Sheet open={open} onOpenChange={onOpenChange} />;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="border-b border-border p-6 pr-12">
          <SheetTitle className="text-xl font-semibold tracking-normal">{order.orderId}</SheetTitle>
          <SheetDescription className="mt-1">
            {order.customerName} - {order.product}
          </SheetDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill status={order.status} />
            <PaymentPill payment={order.paymentType} />
            <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              WhatsApp {getWhatsAppStatus(order)}
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Name" value={order.customerName} />
              <DetailRow label="Phone" value={order.phone} />
              <DetailRow label="Address" value={order.address} />
              <DetailRow label="City" value={order.city} />
              <DetailRow label="State" value={order.state} />
              <DetailRow label="PIN" value={order.pinCode} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Product" value={order.product} />
              <DetailRow label="Variant" value={getOrderVariant(order)} />
              <DetailRow label="Size" value={order.size} />
              <DetailRow label="Quantity" value={order.quantity} />
              <DetailRow label="Amount" value={formatCurrency(order.amount)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Courier" value={order.courier} />
              <DetailRow label="Tracking" value={order.trackingId} />
              <DetailRow label="Track Link" value={order.trackingUrl} />
              <DetailRow label="Shopdeck Status" value={getSourceValue(order, "Order Status")} />
              <DetailRow label="Shopdeck Order Date" value={formatDateTime(order.orderDate)} />
              <DetailRow label="Imported At" value={formatDateTime(order.createdAt)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="WhatsApp" value={getWhatsAppStatus(order)} />
              <DetailRow label="Last WhatsApp" value={order.whatsappSentAt ? formatDateTime(order.whatsappSentAt) : "Not sent"} />
              <DetailRow label="Call Status" value={getSourceValue(order, "Call Status")} />
              <DetailRow label="Call Remarks" value={getSourceValue(order, "Call Remarks")} />
              <DetailRow label="Last Call" value="Not recorded locally" />
              <DetailRow label="Internal Notes" value="No notes yet" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.changeLog.slice().reverse().map((change) => (
                <div key={change.id} className="rounded-lg border border-border bg-background/45 p-3">
                  <p className="text-sm font-medium">{change.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(change.createdAt)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{change.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border p-4">
          <Button variant="outline" onClick={() => window.print()}>
            <PackageCheck />
            Print
          </Button>
          {onSendWhatsApp ? (
            <Button onClick={() => onSendWhatsApp(order)}>
              <MessageCircle />
              Dispatch WhatsApp
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
