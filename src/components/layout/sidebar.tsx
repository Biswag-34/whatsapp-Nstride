import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { navigationItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/stores/use-layout-store";

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="space-y-1">
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
            onClick={onNavigate}
            className={cn(
              "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground",
              isActive &&
                "bg-primary/10 text-primary shadow-sm shadow-emerald-900/5 dark:bg-primary/15 dark:text-emerald-100",
            )}
          >
            <Icon className="size-4" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {isActive ? <ChevronRight className="size-4 opacity-70" /> : null}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-4 pt-5">
        <BrandMark />
      </div>

      <div className="px-3">
        <NavigationLinks onNavigate={onNavigate} />
      </div>

      <div className="mt-auto px-4 pb-5">
        <div className="rounded-xl border border-border bg-background/55 p-4 shadow-sm dark:bg-white/[0.03]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-secondary/15 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <Badge variant="success">Live CRM</Badge>
          </div>
          <p className="text-sm font-semibold text-foreground">
            Comfort • Protection
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Every Step Matters
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const isMobileSidebarOpen = useLayoutStore((state) => state.isMobileSidebarOpen);
  const closeMobileSidebar = useLayoutStore((state) => state.closeMobileSidebar);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-background/75 backdrop-blur-2xl lg:block">
        <SidebarContent />
      </aside>

      <Dialog open={isMobileSidebarOpen} onOpenChange={closeMobileSidebar}>
        <DialogContent className="left-0 top-0 h-dvh w-80 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 p-0">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Main N-Stride Command Center navigation.
          </DialogDescription>
          <SidebarContent onNavigate={closeMobileSidebar} />
          <Separator />
        </DialogContent>
      </Dialog>
    </>
  );
}
