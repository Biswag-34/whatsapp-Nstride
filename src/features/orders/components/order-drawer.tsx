import {
  Copy,
  CreditCard,
  Edit3,
  ExternalLink,
  FileText,
  MessageCircle,
  PackageCheck,
  Send,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerCard } from "@/features/orders/components/customer-card";
import { PaymentBadge } from "@/features/orders/components/payment-badge";
import { ShippingCard } from "@/features/orders/components/shipping-card";
import { StatusBadge } from "@/features/orders/components/status-badge";
import type { Order } from "@/features/orders/types";
import {
  formatCurrency,
  formatDate,
  getDispatchWhatsAppMessage,
  getWhatsAppUrl,
} from "@/features/orders/utils/order-formatters";
import { useOrdersStore } from "@/stores/use-orders-store";

interface OrderDrawerProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function OrderDrawer({ order, open, onOpenChange }: OrderDrawerProps) {
  const deleteOrder = useOrdersStore((state) => state.deleteOrder);
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);

  if (!order) {
    return null;
  }

  const currentOrder = order;

  function copyOrder() {
    void navigator.clipboard.writeText(getDispatchWhatsAppMessage(currentOrder));
  }

  function handleDelete() {
    const confirmed = window.confirm(`Delete ${currentOrder.orderId}?`);

    if (confirmed) {
      deleteOrder(currentOrder.id);
      onOpenChange(false);
    }
  }

  function generateOrderCard() {
    const summary = getDispatchWhatsAppMessage(currentOrder);
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${currentOrder.orderId}-card.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 flex h-dvh w-full max-w-3xl translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-y-0 border-r-0 bg-background p-0 shadow-2xl sm:w-[min(760px,92vw)]">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <DialogTitle className="pr-10 text-xl">{currentOrder.orderId}</DialogTitle>
          <DialogDescription className="mt-2 flex flex-wrap items-center gap-2">
            <span>{currentOrder.customerName}</span>
            <span aria-hidden="true">{"\u2022"}</span>
            <span>{formatDate(currentOrder.orderDate)}</span>
          </DialogDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={currentOrder.status} />
            <PaymentBadge paymentMode={currentOrder.paymentMode} />
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <CustomerCard order={currentOrder} />

          <div className="glass-panel rounded-xl border border-border p-5">
            <div className="mb-4 flex items-center gap-2">
              <PackageCheck className="size-4 text-primary" />
              <h3 className="text-base font-semibold tracking-normal text-foreground">
                Product Information
              </h3>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Product Name
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{currentOrder.product}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Category
                    </p>
                    <p className="mt-1 text-sm text-foreground">{currentOrder.category}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Size</p>
                    <p className="mt-1 text-sm text-foreground">{currentOrder.size}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Quantity
                    </p>
                    <p className="mt-1 text-sm text-foreground">{currentOrder.quantity}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/[0.03]">
                <DetailRow label="Amount" value={formatCurrency(currentOrder.amount)} />
                <DetailRow label="Discount" value={formatCurrency(currentOrder.discount)} />
                <DetailRow label="Tax" value={formatCurrency(currentOrder.tax)} />
                <DetailRow label="Total" value={formatCurrency(currentOrder.total)} />
              </div>
            </div>
          </div>

          <ShippingCard order={currentOrder} />

          <div className="glass-panel rounded-xl border border-border p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <h3 className="text-base font-semibold tracking-normal text-foreground">
                Actions
              </h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline">
                <Edit3 />
                Edit Order
              </Button>
              <Button type="button" variant="outline" onClick={handleDelete}>
                <Trash2 />
                Delete Order
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => updateOrderStatus(currentOrder.id, "WhatsApp Sent")}
              >
                <Send />
                Mark WhatsApp Sent
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => updateOrderStatus(currentOrder.id, "Dispatched")}
              >
                <PackageCheck />
                Mark Dispatched
              </Button>
              <Button type="button" variant="outline" onClick={generateOrderCard}>
                <FileText />
                Generate Order Card
              </Button>
              <Button type="button" variant="outline" asChild>
                <a href={getWhatsAppUrl(currentOrder)} target="_blank" rel="noreferrer">
                  <MessageCircle />
                  Open WhatsApp
                  <ExternalLink />
                </a>
              </Button>
              <Button type="button" variant="premium" className="sm:col-span-2" onClick={copyOrder}>
                <Copy />
                Copy Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
