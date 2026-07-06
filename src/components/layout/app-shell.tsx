import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useDispatchStore } from "@/stores/use-dispatch-store";
import { useEffect } from "react";

export function AppShell() {
  const hydrate = useDispatchStore((state) => state.hydrate);

  useKeyboardShortcuts();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen text-foreground">
      <Sidebar />
      <div className="min-h-screen lg:pl-72">
        <TopNav />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
