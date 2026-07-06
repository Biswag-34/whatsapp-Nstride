import Dexie, { type Table } from "dexie";

import type {
  ActivityEvent,
  AppSettings,
  DispatchOrder,
  ImportSession,
  MessageTemplate,
} from "@/features/dispatch/types";

export class DispatchDatabase extends Dexie {
  orders!: Table<DispatchOrder, string>;
  importSessions!: Table<ImportSession, string>;
  activities!: Table<ActivityEvent, string>;
  templates!: Table<MessageTemplate, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("nstride-dispatch-center");
    this.version(1).stores({
      activities: "id, createdAt, type",
      importSessions: "id, importedAt, fileName",
      orders:
        "id, shopdeckOrderId, phone, status, importSessionId, updatedAt, whatsappSentAt, paymentType",
      settings: "id",
      templates: "id, isDefault, updatedAt",
    });
  }
}

export const db = new DispatchDatabase();

export function canUseIndexedDb() {
  return typeof indexedDB !== "undefined";
}
