import { Menu, Moon, Search, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLayoutStore } from "@/stores/use-layout-store";
import { useThemeStore } from "@/stores/use-theme-store";

export function TopNav() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/72 backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
          aria-label="Open navigation"
        >
          <Menu />
        </Button>
        <div className="relative hidden min-w-0 flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-global-search
            className="max-w-xl bg-white/70 pl-9 dark:bg-white/[0.05]"
            placeholder="Search orders, tracking, phone"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <div className="hidden rounded-full border border-border bg-background/75 px-3 py-2 text-sm font-medium text-foreground sm:block">
            Dispatch Ops
          </div>
        </div>
      </div>
    </header>
  );
}
