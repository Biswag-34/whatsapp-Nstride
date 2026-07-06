import { Badge } from "@/components/ui/badge";
import type { DispatchOrderStatus, PaymentType } from "@/features/dispatch/types";

export function StatusPill({ status }: { status: DispatchOrderStatus }) {
  const label = {
    cancelled: "Cancelled",
    delivered: "Delivered",
    pending_dispatch: "Pending Dispatch",
    rto: "RTO",
    whatsapp_ready: "WhatsApp Ready",
    whatsapp_sent: "WhatsApp Sent",
  }[status];
  const variant =
    status === "pending_dispatch" || status === "whatsapp_ready"
      ? "warning"
      : status === "cancelled" || status === "rto"
        ? "slate"
        : "success";

  return <Badge variant={variant}>{label}</Badge>;
}

export function PaymentPill({ payment }: { payment: PaymentType }) {
  const variant = payment === "COD" ? "warning" : payment === "Prepaid" ? "success" : "slate";

  return <Badge variant={variant}>{payment}</Badge>;
}
