import { AlertTriangle, CheckCircle2, CopyX, DatabaseZap } from "lucide-react";

import type { ImportSummary } from "@/features/import-center/types";
import { cn } from "@/lib/utils";

interface ImportSummaryCardsProps {
  summary: ImportSummary;
}

export function ImportSummaryCards({ summary }: ImportSummaryCardsProps) {
  const items = [
    {
      label: "Imported",
      value: summary.imported,
      icon: DatabaseZap,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Skipped",
      value: summary.skipped,
      icon: CopyX,
      tone: "bg-slate-900/10 text-slate-800 dark:bg-white/10 dark:text-slate-100",
    },
    {
      label: "Duplicates",
      value: summary.duplicates,
      icon: CopyX,
      tone: "bg-amber-500/10 text-amber-700 dark:text-amber-200",
    },
    {
      label: "Errors",
      value: summary.errors,
      icon: AlertTriangle,
      tone: "bg-rose-500/10 text-rose-700 dark:text-rose-200",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.value === 0 && item.label === "Errors" ? CheckCircle2 : item.icon;

        return (
          <div key={item.label} className="glass-panel rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
                  {item.value}
                </p>
              </div>
              <div className={cn("rounded-xl p-2.5", item.tone)}>
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
