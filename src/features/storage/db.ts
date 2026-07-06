import Dexie, { type Table } from "dexie";

import type {
  AppSettings,
  CommunicationMessage,
  DispatchHistoryEvent,
  DispatchOrder,
  ImportSession,
  MessageTemplate,
} from "@/features/dispatch/types";

export class DispatchDatabase extends Dexie {
  orders!: Table<DispatchOrder, string>;
  importSessions!: Table<ImportSession, string>;
  dispatchHistory!: Table<DispatchHistoryEvent, string>;
  messageHistory!: Table<CommunicationMessage, string>;
  templates!: Table<MessageTemplate, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("nstride-shopdeck-dispatch-center");
    this.version(1).stores({
      dispatchHistory: "id, orderId, createdAt, type, importSessionId",
      importSessions: "id, importedAt, fileName",
      orders:
        "id, orderId, phone, status, importSessionId, updatedAt, whatsappSentAt, paymentType, courier, city, state, orderDate",
      settings: "id",
      templates: "id, isDefault, updatedAt",
    });
    this.version(2).stores({
      dispatchHistory: "id, orderId, createdAt, type, importSessionId",
      importSessions: "id, importedAt, fileName",
      messageHistory: "id, orderId, createdAt, templateId, templateType",
      orders:
        "id, orderId, phone, status, importSessionId, updatedAt, whatsappSentAt, paymentType, courier, city, state, orderDate",
      settings: "id",
      templates: "id, isDefault, type, updatedAt",
    });
  }
}

export const db = new DispatchDatabase();

export function canUseIndexedDb() {
  return typeof indexedDB !== "undefined";
}
