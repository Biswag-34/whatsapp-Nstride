import type {
  AppSettings,
  DispatchHistoryEvent,
  DispatchOrder,
  ImportSession,
  MessageTemplate,
  OrderChangeLogEntry,
} from "@/features/dispatch/types";
import { canUseIndexedDb, db } from "@/features/storage/db";

const STORAGE_KEY = "nstride-shopdeck-dispatch-fallback";

interface Snapshot {
  dispatchHistory: DispatchHistoryEvent[];
  importSessions: ImportSession[];
  orders: DispatchOrder[];
  settings?: AppSettings;
  templates: MessageTemplate[];
}

const emptySnapshot: Snapshot = {
  dispatchHistory: [],
  importSessions: [],
  orders: [],
  templates: [],
};

function readFallback(): Snapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptySnapshot, ...JSON.parse(raw) } : emptySnapshot;
  } catch {
    return emptySnapshot;
  }
}

function writeFallback(snapshot: Snapshot) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function sortByNewest<T extends { createdAt?: string; importedAt?: string }>(items: T[]) {
  return items.sort((a, b) =>
    String(b.createdAt ?? b.importedAt ?? "").localeCompare(String(a.createdAt ?? a.importedAt ?? "")),
  );
}

export async function getStorageSnapshot(): Promise<Snapshot> {
  if (canUseIndexedDb()) {
    const [orders, importSessions, dispatchHistory, templates, settings] = await Promise.all([
      db.orders.toArray(),
      db.importSessions.toArray(),
      db.dispatchHistory.toArray(),
      db.templates.toArray(),
      db.settings.get("settings"),
    ]);

    return {
      dispatchHistory: sortByNewest(dispatchHistory),
      importSessions: sortByNewest(importSessions),
      orders,
      settings,
      templates,
    };
  }

  const snapshot = readFallback();

  return {
    ...snapshot,
    dispatchHistory: sortByNewest(snapshot.dispatchHistory),
    importSessions: sortByNewest(snapshot.importSessions),
  };
}

export async function upsertOrders(
  orders: DispatchOrder[],
  session: ImportSession,
  dispatchHistory: DispatchHistoryEvent[],
) {
  if (canUseIndexedDb()) {
    await db.transaction("rw", db.orders, db.importSessions, db.dispatchHistory, async () => {
      await db.orders.bulkPut(orders);
      await db.importSessions.put(session);
      await db.dispatchHistory.bulkPut(dispatchHistory);
    });
    return;
  }

  const snapshot = readFallback();
  const byId = new Map(snapshot.orders.map((order) => [order.id, order]));
  orders.forEach((order) => byId.set(order.id, order));
  writeFallback({
    ...snapshot,
    dispatchHistory: [...dispatchHistory, ...snapshot.dispatchHistory],
    importSessions: [session, ...snapshot.importSessions],
    orders: Array.from(byId.values()),
  });
}

function createWhatsAppChange(order: DispatchOrder, timestamp: string): OrderChangeLogEntry {
  return {
    createdAt: timestamp,
    description: `WhatsApp dispatch message sent for order #${order.orderId}.`,
    id: crypto.randomUUID(),
    title: "WhatsApp Sent",
  };
}

function createWhatsAppHistory(order: DispatchOrder, timestamp: string): DispatchHistoryEvent {
  return {
    createdAt: timestamp,
    description: `WhatsApp dispatch message sent for order #${order.orderId}.`,
    id: crypto.randomUUID(),
    orderId: order.orderId,
    title: "WhatsApp Sent",
    type: "whatsapp",
  };
}

export async function markOrdersWhatsAppSent(orderIds: string[]) {
  const timestamp = new Date().toISOString();

  if (canUseIndexedDb()) {
    await db.transaction("rw", db.orders, db.dispatchHistory, async () => {
      const orders = (await db.orders.bulkGet(orderIds)).filter(
        (order): order is DispatchOrder => Boolean(order),
      );
      await db.orders.bulkPut(
        orders.map((order) => ({
          ...order,
          changeLog: [...order.changeLog, createWhatsAppChange(order, timestamp)],
          status: "whatsapp_sent",
          updatedAt: timestamp,
          whatsappSentAt: timestamp,
        })),
      );
      await db.dispatchHistory.bulkPut(orders.map((order) => createWhatsAppHistory(order, timestamp)));
    });
    return;
  }

  const snapshot = readFallback();
  const ordersToUpdate = snapshot.orders.filter((order) => orderIds.includes(order.id));
  writeFallback({
    ...snapshot,
    dispatchHistory: [
      ...ordersToUpdate.map((order) => createWhatsAppHistory(order, timestamp)),
      ...snapshot.dispatchHistory,
    ],
    orders: snapshot.orders.map((order) =>
      orderIds.includes(order.id)
        ? {
            ...order,
            changeLog: [...order.changeLog, createWhatsAppChange(order, timestamp)],
            status: "whatsapp_sent",
            updatedAt: timestamp,
            whatsappSentAt: timestamp,
          }
        : order,
    ),
  });
}

export async function saveTemplate(template: MessageTemplate) {
  if (canUseIndexedDb()) {
    await db.templates.put(template);
    return;
  }

  const snapshot = readFallback();
  writeFallback({
    ...snapshot,
    templates: [
      template,
      ...snapshot.templates.filter((current) => current.id !== template.id),
    ],
  });
}

export async function saveSettings(settings: AppSettings) {
  if (canUseIndexedDb()) {
    await db.settings.put(settings);
    return;
  }

  writeFallback({ ...readFallback(), settings });
}
