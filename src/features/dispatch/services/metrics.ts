import type {
  DispatchMetrics,
  DispatchOrder,
  ImportSession,
} from "@/features/dispatch/types";

export function buildMetrics(
  orders: DispatchOrder[],
  sessions: ImportSession[],
): DispatchMetrics {
  const today = new Date().toISOString().slice(0, 10);
  const todayImport = sessions
    .filter((session) => session.importedAt.slice(0, 10) === today)
    .reduce((total, session) => total + session.imported + session.updated, 0);

  return {
    cancelled: orders.filter((order) => order.status === "cancelled").length,
    cod: orders.filter((order) => order.paymentType === "COD").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    latestImportSession: sessions[0],
    pendingWhatsApp: orders.filter(
      (order) => order.status === "pending_dispatch" || order.status === "whatsapp_ready",
    ).length,
    prepaid: orders.filter((order) => order.paymentType === "Prepaid").length,
    todayImport,
    totalOrders: orders.length,
    whatsappSent: orders.filter((order) => order.status === "whatsapp_sent").length,
  };
}
