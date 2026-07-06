import { getOrderVariant } from "@/features/dispatch/services/operations";
import type { DispatchOrder, MessageTemplate } from "@/features/dispatch/types";
import { formatCurrency } from "@/lib/utils";

export const defaultDispatchTemplate = `Hello {{Customer}} 👋

Thank you for choosing N-Stride.

Your order has been successfully dispatched.

━━━━━━━━━━━━━━━

📦 ORDER DETAILS

Order ID:
{{OrderID}}

Product:
{{Product}}

Variant:
{{Variant}}

Size:
{{Size}}

Quantity:
{{Quantity}}

Amount:
{{Amount}}

Payment:
{{Payment}}

━━━━━━━━━━━━━━━

🚚 SHIPPING DETAILS

Courier:
{{Courier}}

Tracking ID:
{{Tracking}}

Track Shipment:
{{TrackingURL}}

━━━━━━━━━━━━━━━

📍 DELIVERY ADDRESS

{{Address}}

━━━━━━━━━━━━━━━

Thank you for choosing N-Stride.

Comfort • Protection • Every Step Matters.

https://nstride.shop`;

export const defaultMessageTemplates: MessageTemplate[] = [
  {
    body: defaultDispatchTemplate,
    id: "default-dispatch",
    isDefault: true,
    name: "Default Dispatch",
    type: "default_dispatch",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}} 👋

Your N-Stride order {{OrderID}} has been delivered.

We hope every step feels comfortable and protected.

Product: {{Product}}
Amount: {{Amount}}

Comfort • Protection • Every Step Matters.
https://nstride.shop`,
    id: "delivered",
    isDefault: false,
    name: "Delivered",
    type: "delivered",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}} 👋

Tracking has been updated for your N-Stride order.

Order ID: {{OrderID}}
Courier: {{Courier}}
Tracking ID: {{Tracking}}
Track: {{TrackingURL}}

Comfort • Protection • Every Step Matters.`,
    id: "tracking-updated",
    isDefault: false,
    name: "Tracking Updated",
    type: "tracking_updated",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}} 👋

Your N-Stride order {{OrderID}} is taking a little longer than expected.

Courier: {{Courier}}
Tracking ID: {{Tracking}}
Track: {{TrackingURL}}

Thank you for your patience.
Comfort • Protection • Every Step Matters.`,
    id: "delay-notification",
    isDefault: false,
    name: "Delay Notification",
    type: "delay_notification",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}} 👋

Your replacement request for N-Stride order {{OrderID}} has been noted.

Product: {{Product}}
Size: {{Size}}
Address: {{Address}}

Our team will coordinate the next step.`,
    id: "replacement",
    isDefault: false,
    name: "Replacement",
    type: "replacement",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}} 👋

Your exchange request for order {{OrderID}} has been noted.

Product: {{Product}}
Current Size: {{Size}}
Delivery Address: {{Address}}

N-Stride support will follow up shortly.`,
    id: "exchange",
    isDefault: false,
    name: "Exchange",
    type: "exchange",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}} 👋

Your return request for N-Stride order {{OrderID}} has been noted.

Product: {{Product}}
Amount: {{Amount}}
Address: {{Address}}

Our team will review and follow up.`,
    id: "return",
    isDefault: false,
    name: "Return",
    type: "return",
    updatedAt: new Date().toISOString(),
  },
];

export function getTemplateVariables(order: DispatchOrder) {
  return {
    Address: order.address || "Not available",
    Amount: formatCurrency(order.amount),
    Courier: order.courier || "Not available",
    Customer: order.customerName || "Customer",
    CustomerName: order.customerName || "Customer",
    OrderID: order.orderId,
    Payment: order.paymentType,
    Product: order.product || "Not available",
    Quantity: String(order.quantity || 1),
    Size: order.size || "Not specified",
    Tracking: order.trackingId || "Not available",
    TrackingID: order.trackingId || "Not available",
    TrackingURL: order.trackingUrl || "Not available",
    Variant: getOrderVariant(order),
  };
}

export function renderMessageTemplate(order: DispatchOrder, template: string) {
  const variables = getTemplateVariables(order);

  return Object.entries(variables).reduce(
    (message, [key, value]) => message.replaceAll(`{{${key}}}`, value),
    template,
  );
}

export function renderDispatchMessage(order: DispatchOrder, template: string) {
  return renderMessageTemplate(order, template);
}

export function getWhatsAppUrl(order: DispatchOrder, template: string) {
  const phone = order.phone.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(renderMessageTemplate(order, template))}`;
}
