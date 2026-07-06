import { NavLink, useLocation } from "react-router-dom";

import { BrandMark } from "@/components/layout/brand-mark";
import { navigationItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/stores/use-layout-store";

export function Sidebar() {
  const location = useLocation();
  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen);
  const closeSidebar = useLayoutStore((state) => state.closeSidebar);

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background/86 backdrop-blur-2xl transition-transform lg:z-40 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="px-4 pb-4 pt-5">
            <BrandMark />
          </div>
          <nav className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground",
                    isActive &&
                      "bg-primary/10 text-primary shadow-sm dark:bg-primary/15 dark:text-emerald-100",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-auto p-4">
            <div className="rounded-xl border border-border bg-background/55 p-4 dark:bg-white/[0.03]">
              <p className="text-sm font-semibold text-foreground">N-Stride Dispatch Center</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Shopdeck import, duplicate detection, dispatch queue, WhatsApp handoff.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
