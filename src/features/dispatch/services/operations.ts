import type { DispatchOrder, ImportSession } from "@/features/dispatch/types";

export function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  return digits.length >= 10 && digits.length <= 13;
}

export function getWhatsAppStatus(order: DispatchOrder) {
  if (order.whatsappSentAt || order.status === "whatsapp_sent") {
    return "Sent";
  }

  if (order.status === "whatsapp_ready" || order.trackingId || order.trackingUrl) {
    return "Ready";
  }

  return "Pending";
}

export function getSourceValue(order: DispatchOrder, key: string) {
  return order.sourceRow?.[key] ?? "";
}

export function getOrderVariant(order: DispatchOrder) {
  return getSourceValue(order, "Sku ID") || getSourceValue(order, "Color") || order.size || "Not set";
}

export function isPendingWhatsApp(order: DispatchOrder) {
  return (
    getWhatsAppStatus(order) !== "Sent" &&
    order.status !== "cancelled" &&
    order.status !== "delivered" &&
    order.status !== "rto"
  );
}

export function isOlderThanHours(value: string, hours: number) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp > hours * 60 * 60 * 1000;
}

export function getDuplicatePhoneOrders(orders: DispatchOrder[]) {
  const byPhone = new Map<string, DispatchOrder[]>();

  orders.forEach((order) => {
    const phone = order.phone.replace(/\D/g, "");

    if (phone) {
      byPhone.set(phone, [...(byPhone.get(phone) ?? []), order]);
    }
  });

  return Array.from(byPhone.values()).filter((group) => group.length > 1).flat();
}

export function buildOperationsSummary(orders: DispatchOrder[], sessions: ImportSession[]) {
  const today = new Date().toISOString().slice(0, 10);
  const todayImportedOrders = sessions
    .filter((session) => session.importedAt.slice(0, 10) === today)
    .reduce((total, session) => total + session.imported + session.updated, 0);

  return {
    cancelled: orders.filter((order) => order.status === "cancelled").length,
    codOrders: orders.filter((order) => order.paymentType === "COD").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    dispatched: orders.filter((order) =>
      ["whatsapp_ready", "whatsapp_sent", "delivered"].includes(order.status),
    ).length,
    duplicatePhoneNumbers: getDuplicatePhoneOrders(orders).length,
    invalidPhone: orders.filter((order) => !isValidPhone(order.phone)).length,
    ordersUpdatedToday: orders.filter((order) => order.updatedAt.slice(0, 10) === today).length,
    ordersWithoutTracking: orders.filter((order) => !order.trackingId).length,
    pendingDispatch: orders.filter((order) => order.status === "pending_dispatch").length,
    pendingWhatsApp: orders.filter(isPendingWhatsApp).length,
    pendingWhatsAppOlderThan24h: orders.filter(
      (order) => isPendingWhatsApp(order) && isOlderThanHours(order.updatedAt, 24),
    ).length,
    prepaidOrders: orders.filter((order) => order.paymentType === "Prepaid").length,
    rto: orders.filter((order) => order.status === "rto").length,
    todayImportedOrders,
    totalOrders: orders.length,
    whatsappSent: orders.filter((order) => getWhatsAppStatus(order) === "Sent").length,
  };
}

export function getPendingQueueOrders(orders: DispatchOrder[]) {
  return orders
    .filter((order) => order.status === "pending_dispatch" || order.status === "whatsapp_ready")
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate));
}
