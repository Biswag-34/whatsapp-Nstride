import { create } from "zustand";

import { buildMetrics } from "@/features/dispatch/services/metrics";
import { parseOrderFile } from "@/features/dispatch/services/import-parser";
import { defaultDispatchTemplate } from "@/features/dispatch/services/template-engine";
import type {
  ActivityEvent,
  AppSettings,
  DispatchMetrics,
  DispatchOrder,
  ImportSession,
  MessageTemplate,
} from "@/features/dispatch/types";
import {
  getStorageSnapshot,
  markOrdersWhatsAppSent,
  saveSettings,
  saveTemplate,
  upsertOrders,
} from "@/features/storage/repository";

interface DispatchState {
  activities: ActivityEvent[];
  importSessions: ImportSession[];
  isLoading: boolean;
  lastError: string;
  metrics: DispatchMetrics;
  orders: DispatchOrder[];
  settings: AppSettings;
  templates: MessageTemplate[];
  hydrate: () => Promise<void>;
  importFile: (file: File) => Promise<void>;
  markWhatsAppSent: (orderIds: string[]) => Promise<void>;
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

const defaultTemplate: MessageTemplate = {
  id: "default-dispatch",
  body: defaultDispatchTemplate,
  isDefault: true,
  name: "Default Dispatch Message",
  updatedAt: new Date().toISOString(),
};

const emptyMetrics = buildMetrics([], []);

export const useDispatchStore = create<DispatchState>((set, get) => ({
  activities: [],
  importSessions: [],
  isLoading: false,
  lastError: "",
  metrics: emptyMetrics,
  orders: [],
  settings: defaultSettings,
  templates: [defaultTemplate],
  hydrate: async () => {
    set({ isLoading: true, lastError: "" });

    try {
      const snapshot = await getStorageSnapshot();
      const templates = snapshot.templates.length > 0 ? snapshot.templates : [defaultTemplate];
      const settings = snapshot.settings ?? defaultSettings;

      set({
        activities: snapshot.activities,
        importSessions: snapshot.importSessions,
        isLoading: false,
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
      const parsed = await parseOrderFile(file, get().orders);
      await upsertOrders(parsed.orders, parsed.session, parsed.activities);
      await get().hydrate();
    } catch {
      set({ isLoading: false, lastError: "Import failed. Check the file format." });
    }
  },
  markWhatsAppSent: async (orderIds) => {
    await markOrdersWhatsAppSent(orderIds);
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
