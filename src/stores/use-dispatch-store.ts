import { create } from "zustand";

import { buildMetrics } from "@/features/dispatch/services/metrics";
import { importShopdeckFile } from "@/features/dispatch/services/shopdeck-import-service";
import { defaultMessageTemplates } from "@/features/dispatch/services/template-engine";
import type {
  AppSettings,
  CommunicationMessage,
  DispatchHistoryEvent,
  DispatchMetrics,
  DispatchOrder,
  ImportSession,
  MessageTemplate,
} from "@/features/dispatch/types";
import {
  getStorageSnapshot,
  markOrdersWhatsAppSent,
  saveCommunicationMessage,
  saveSettings,
  saveTemplate,
  upsertOrders,
} from "@/features/storage/repository";

interface DispatchState {
  dispatchHistory: DispatchHistoryEvent[];
  importSessions: ImportSession[];
  isLoading: boolean;
  lastImportSession?: ImportSession;
  lastError: string;
  messageHistory: CommunicationMessage[];
  metrics: DispatchMetrics;
  orders: DispatchOrder[];
  settings: AppSettings;
  templates: MessageTemplate[];
  hydrate: () => Promise<void>;
  importFile: (file: File) => Promise<void>;
  markWhatsAppSent: (orderIds: string[], user?: string) => Promise<void>;
  recordGeneratedMessage: (message: CommunicationMessage) => Promise<void>;
  saveTemplate: (template: MessageTemplate) => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
}

const defaultSettings: AppSettings = {
  id: "settings",
  shopdeckColumnMap: {},
  supportPhone: "+91 98765 43210",
  updatedAt: new Date().toISOString(),
  website: "https://nstride.shop",
};

const emptyMetrics = buildMetrics([], []);

function mergeTemplates(templates: MessageTemplate[]) {
  const normalized = templates.map((template) => ({
    ...template,
    type: template.type ?? ("default_dispatch" as const),
  }));
  const byId = new Map(defaultMessageTemplates.map((template) => [template.id, template]));

  normalized.forEach((template) => byId.set(template.id, template));

  return Array.from(byId.values());
}

export const useDispatchStore = create<DispatchState>((set, get) => ({
  dispatchHistory: [],
  importSessions: [],
  isLoading: false,
  lastImportSession: undefined,
  lastError: "",
  messageHistory: [],
  metrics: emptyMetrics,
  orders: [],
  settings: defaultSettings,
  templates: defaultMessageTemplates,
  hydrate: async () => {
    set({ isLoading: true, lastError: "" });

    try {
      const snapshot = await getStorageSnapshot();
      const templates =
        snapshot.templates.length > 0 ? mergeTemplates(snapshot.templates) : defaultMessageTemplates;
      const settings = snapshot.settings ?? defaultSettings;

      set({
        dispatchHistory: snapshot.dispatchHistory,
        importSessions: snapshot.importSessions,
        isLoading: false,
        messageHistory: snapshot.messageHistory,
        metrics: buildMetrics(snapshot.orders, snapshot.importSessions),
        orders: snapshot.orders,
        settings,
        templates,
      });
    } catch {
      set({ isLoading: false, lastError: "Storage could not be loaded." });
    }
  },
  importFile: async (file) => {
    set({ isLoading: true, lastError: "" });

    try {
      const parsed = await importShopdeckFile(file, get().orders);
      await upsertOrders(parsed.orders, parsed.session, parsed.dispatchHistory);
      set({ lastImportSession: parsed.session });
      await get().hydrate();
    } catch {
      set({ isLoading: false, lastError: "Import failed. Check the file format." });
    }
  },
  markWhatsAppSent: async (orderIds, user = "Dispatch Staff") => {
    await markOrdersWhatsAppSent(orderIds, user);
    await get().hydrate();
  },
  recordGeneratedMessage: async (message) => {
    await saveCommunicationMessage(message);
    await get().hydrate();
  },
  saveSettings: async (settings) => {
    await saveSettings({ ...settings, updatedAt: new Date().toISOString() });
    await get().hydrate();
  },
  saveTemplate: async (template) => {
    await saveTemplate({ ...template, updatedAt: new Date().toISOString() });
    await get().hydrate();
  },
}));
