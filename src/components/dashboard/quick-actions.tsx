import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quickActions } from "@/config/navigation";

export function QuickActions() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Quick Actions</CardTitle>
          <Button variant="ghost" size="sm">
            View all
            <ArrowUpRight />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              className="group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-background/60 p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {action.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {action.description}
                </span>
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
