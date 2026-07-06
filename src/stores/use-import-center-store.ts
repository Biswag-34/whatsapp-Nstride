import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ColumnMapping, ImportHistoryItem } from "@/features/import-center/types";

interface ImportCenterState {
  savedMapping: ColumnMapping;
  importHistory: ImportHistoryItem[];
  saveMapping: (mapping: ColumnMapping) => void;
  addImportHistory: (item: ImportHistoryItem) => void;
  clearImportHistory: () => void;
}

export const useImportCenterStore = create<ImportCenterState>()(
  persist(
    (set) => ({
      savedMapping: {},
      importHistory: [],
      saveMapping: (mapping) => set({ savedMapping: mapping }),
      addImportHistory: (item) =>
        set((state) => ({
          importHistory: [item, ...state.importHistory].slice(0, 12),
        })),
      clearImportHistory: () => set({ importHistory: [] }),
    }),
    {
      name: "n-stride-import-center",
    },
  ),
);
