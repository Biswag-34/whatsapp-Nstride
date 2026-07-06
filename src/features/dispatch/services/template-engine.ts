import type { DispatchOrder } from "@/features/dispatch/types";
import { formatCurrency } from "@/lib/utils";

export const defaultDispatchTemplate = `Hello {{CustomerName}},

Thank you for choosing N-Stride.
Your order has been successfully dispatched.

------------------------------
ORDER DETAILS

Order ID: {{OrderID}}
Product: {{Product}}
Size: {{Size}}
Quantity: {{Quantity}}
Amount: {{Amount}}
Payment: {{Payment}}

------------------------------
SHIPPING DETAILS

Courier: {{Courier}}
Tracking ID: {{TrackingID}}
Track Shipment: {{TrackingURL}}

------------------------------
DELIVERY ADDRESS

{{Address}}

Comfort - Protection - Every Step Matters
https://nstride.shop`;

export function renderDispatchMessage(order: DispatchOrder, template: string) {
  return template
    .replaceAll("{{CustomerName}}", order.customerName)
    .replaceAll("{{OrderID}}", order.orderId)
    .replaceAll("{{Product}}", order.product)
    .replaceAll("{{Size}}", order.size || "Not specified")
    .replaceAll("{{Quantity}}", String(order.quantity))
    .replaceAll("{{Amount}}", formatCurrency(order.amount))
    .replaceAll("{{Payment}}", order.paymentType)
    .replaceAll("{{Courier}}", order.courier)
    .replaceAll("{{TrackingID}}", order.trackingId)
    .replaceAll("{{TrackingURL}}", order.trackingUrl || "Not available")
    .replaceAll("{{Address}}", order.address || "Not available");
}

export function getWhatsAppUrl(order: DispatchOrder, template: string) {
  const phone = order.phone.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(
    renderDispatchMessage(order, template),
  )}`;
}
