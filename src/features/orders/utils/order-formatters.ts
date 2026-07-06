import type { Order } from "@/features/orders/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDeliveryAddress(order: Order) {
  return `${order.address}, ${order.city}, ${order.state} - ${order.pinCode}`;
}

export function getDispatchWhatsAppMessage(order: Order) {
  const separator = "\u2501".repeat(15);

  return [
    `Hello ${order.customerName} \uD83D\uDC4B`,
    "",
    "Thank you for choosing N-Stride.",
    "",
    "Your order has been successfully dispatched.",
    "",
    separator,
    "",
    "\uD83D\uDCE6 ORDER DETAILS",
    "",
    "Order ID:",
    order.orderId,
    "",
    "Product:",
    order.product,
    "",
    "Size:",
    order.size,
    "",
    "Quantity:",
    String(order.quantity),
    "",
    "Amount:",
    `\u20B9${formatAmount(order.amount)}`,
    "",
    "Payment:",
    order.paymentMode,
    "",
    separator,
    "",
    "\uD83D\uDE9A SHIPPING DETAILS",
    "",
    "Courier:",
    order.courier,
    "",
    "Tracking ID:",
    order.trackingId,
    "",
    "Track Shipment:",
    order.trackingUrl,
    "",
    separator,
    "",
    "\uD83D\uDCCD DELIVERY ADDRESS",
    "",
    getDeliveryAddress(order),
    "",
    separator,
    "",
    "Thank you for choosing N-Stride.",
    "",
    "Comfort \u2022 Protection \u2022 Every Step Matters.",
    "",
    "https://nstride.shop",
  ].join("\n");
}

export function orderToCsvRow(order: Order) {
  return [
    order.orderId,
    order.customerName,
    order.mobileNumber,
    order.product,
    order.category,
    order.size,
    String(order.quantity),
    String(order.amount),
    order.paymentMode,
    order.courier,
    order.trackingId,
    order.status,
    order.orderDate,
  ];
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getWhatsAppUrl(order: Order) {
  const phone = order.mobileNumber.replace(/\D/g, "");
  const text = encodeURIComponent(getDispatchWhatsAppMessage(order));

  return `https://wa.me/${phone}?text=${text}`;
}
