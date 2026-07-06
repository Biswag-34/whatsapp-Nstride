import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell() {
  return (
    <TooltipProvider delayDuration={120}>
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
    </TooltipProvider>
  );
}
