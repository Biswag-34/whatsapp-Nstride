import { create } from "zustand";

interface LayoutState {
  isMobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isMobileSidebarOpen: false,
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
}));
