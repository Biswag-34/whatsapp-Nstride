import { db, canUseIndexedDb } from "@/features/storage/db";
import type {
  ActivityEvent,
  AppSettings,
  DispatchOrder,
  ImportSession,
  MessageTemplate,
} from "@/features/dispatch/types";

const STORAGE_KEY = "nstride-dispatch-fallback";

interface Snapshot {
  activities: ActivityEvent[];
  importSessions: ImportSession[];
  orders: DispatchOrder[];
  settings?: AppSettings;
  templates: MessageTemplate[];
}

const emptySnapshot: Snapshot = {
  activities: [],
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

export async function getStorageSnapshot(): Promise<Snapshot> {
  if (canUseIndexedDb()) {
    const [orders, importSessionsRaw, activitiesRaw, templates, settings] = await Promise.all([
      db.orders.toArray(),
      db.importSessions.toArray(),
      db.activities.toArray(),
      db.templates.toArray(),
      db.settings.get("settings"),
    ]);
    const importSessions = importSessionsRaw.sort((a, b) =>
      b.importedAt.localeCompare(a.importedAt),
    );
    const activities = activitiesRaw.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { activities, importSessions, orders, settings, templates };
  }

  return readFallback();
}

export async function upsertOrders(
  orders: DispatchOrder[],
  session: ImportSession,
  activities: ActivityEvent[],
) {
  if (canUseIndexedDb()) {
    await db.transaction("rw", db.orders, db.importSessions, db.activities, async () => {
      await db.orders.bulkPut(orders);
      await db.importSessions.put(session);
      await db.activities.bulkPut(activities);
    });
    return;
  }

  const snapshot = readFallback();
  const byId = new Map(snapshot.orders.map((order) => [order.id, order]));
  orders.forEach((order) => byId.set(order.id, order));
  writeFallback({
    ...snapshot,
    activities: [...activities, ...snapshot.activities],
    importSessions: [session, ...snapshot.importSessions],
    orders: Array.from(byId.values()),
  });
}

export async function markOrdersWhatsAppSent(orderIds: string[]) {
  const timestamp = new Date().toISOString();

  if (canUseIndexedDb()) {
    await db.transaction("rw", db.orders, db.activities, async () => {
      const orders = await db.orders.bulkGet(orderIds);
      await db.orders.bulkPut(
        orders
          .filter((order): order is DispatchOrder => Boolean(order))
          .map((order) => ({
            ...order,
            status: "whatsapp_sent",
            updatedAt: timestamp,
            whatsappSentAt: timestamp,
          })),
      );
      await db.activities.bulkPut(
        orderIds.map((orderId) => ({
          id: crypto.randomUUID(),
          createdAt: timestamp,
          description: `WhatsApp marked sent for ${orderId}`,
          title: "WhatsApp Sent",
          type: "whatsapp",
        })),
      );
    });
    return;
  }

  const snapshot = readFallback();
  writeFallback({
    ...snapshot,
    activities: [
      ...orderIds.map((orderId) => ({
        id: crypto.randomUUID(),
        createdAt: timestamp,
        description: `WhatsApp marked sent for ${orderId}`,
        title: "WhatsApp Sent",
        type: "whatsapp" as const,
      })),
      ...snapshot.activities,
    ],
    orders: snapshot.orders.map((order) =>
      orderIds.includes(order.id)
        ? {
            ...order,
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
