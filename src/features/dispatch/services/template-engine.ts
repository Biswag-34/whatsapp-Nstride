import { getOrderVariant } from "@/features/dispatch/services/operations";
import { normalizeWhatsAppPhone } from "@/features/dispatch/services/whatsapp-service";
import type { DispatchOrder, MessageTemplate } from "@/features/dispatch/types";
import { formatCurrency } from "@/lib/utils";

export const defaultDispatchTemplate = `Hello {{Customer}},

Your N-Stride order has been dispatched.

Order ID: {{OrderID}}
Item: {{Product}}
Qty: {{Quantity}}
Amount: {{Amount}} ({{Payment}})

Courier: {{Courier}}
Tracking ID: {{Tracking}}
Track: {{TrackingURL}}

Deliver to:
{{Address}}

N-Stride
Comfort - Protection - Every Step Matters

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
    body: `Hello {{Customer}},

Your N-Stride order {{OrderID}} has been delivered.

Product: {{Product}}
Amount: {{Amount}} ({{Payment}})

Thank you for choosing N-Stride.
https://nstride.shop`,
    id: "delivered",
    isDefault: false,
    name: "Delivered",
    type: "delivered",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}},

Tracking has been updated for your N-Stride order {{OrderID}}.

Courier: {{Courier}}
Tracking ID: {{Tracking}}
Track: {{TrackingURL}}

N-Stride`,
    id: "tracking-updated",
    isDefault: false,
    name: "Tracking Updated",
    type: "tracking_updated",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}},

Your N-Stride order {{OrderID}} is taking a little longer than expected.

Tracking: {{Tracking}}
Track: {{TrackingURL}}

Thank you for your patience.
N-Stride`,
    id: "delay-notification",
    isDefault: false,
    name: "Delay Notification",
    type: "delay_notification",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}},

Your replacement request for order {{OrderID}} has been noted.

Item: {{Product}}
Address: {{Address}}

N-Stride support will follow up shortly.`,
    id: "replacement",
    isDefault: false,
    name: "Replacement",
    type: "replacement",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}},

Your exchange request for order {{OrderID}} has been noted.

Item: {{Product}}
Address: {{Address}}

N-Stride support will follow up shortly.`,
    id: "exchange",
    isDefault: false,
    name: "Exchange",
    type: "exchange",
    updatedAt: new Date().toISOString(),
  },
  {
    body: `Hello {{Customer}},

Your return request for order {{OrderID}} has been noted.

Item: {{Product}}
Amount: {{Amount}} ({{Payment}})

N-Stride support will follow up shortly.`,
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
  const phone = normalizeWhatsAppPhone(order.phone);
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(renderMessageTemplate(order, template))}`;
}
