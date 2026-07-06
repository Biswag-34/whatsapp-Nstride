import { create } from "zustand";

interface LayoutState {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarOpen: false,
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
