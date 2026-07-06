import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bell,
  Command,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/stores/use-layout-store";
import { useThemeStore } from "@/stores/use-theme-store";

const searchSchema = z.object({
  query: z.string().trim().max(80),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function TopNav() {
  const toggleMobileSidebar = useLayoutStore((state) => state.toggleMobileSidebar);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { register, handleSubmit } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  function onSearch(values: SearchFormValues) {
    const query = values.query;

    if (query.length > 0) {
      window.dispatchEvent(new CustomEvent("nstride:search", { detail: { query } }));
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/72 backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleMobileSidebar}
          aria-label="Open navigation"
        >
          <Menu />
        </Button>

        <form
          onSubmit={handleSubmit(onSearch)}
          className="relative hidden min-w-0 flex-1 md:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            {...register("query")}
            className="h-10 max-w-xl bg-white/70 pl-9 pr-24 dark:bg-white/[0.05]"
            placeholder="Search orders, customers, messages"
            aria-label="Search"
          />
          <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground xl:flex">
            <Command className="size-3" />
            K
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" size="icon" className="md:hidden">
                <Search />
                <span className="sr-only">Search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun /> : <Moon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{theme === "dark" ? "Light mode" : "Dark mode"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Notifications">
                <span className="relative">
                  <Bell />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-secondary ring-2 ring-background" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-full border border-border bg-background/75 p-1 pr-2 shadow-sm transition-colors hover:bg-muted/70",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                aria-label="Open profile menu"
              >
                <Avatar className="size-8">
                  <AvatarFallback>NS</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground sm:inline">
                  Ops Lead
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>N-Stride Team</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserRound className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShieldCheck className="size-4" />
                Compliance status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
