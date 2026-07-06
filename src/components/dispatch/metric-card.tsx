import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "emerald" | "slate" | "amber";
  value: string | number;
}

const tones = {
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-200",
  default: "bg-primary/10 text-primary dark:text-emerald-100",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  slate: "bg-slate-500/10 text-slate-700 dark:text-slate-200",
};

export function MetricCard({ icon: Icon, label, tone = "default", value }: MetricCardProps) {
  return (
    <Card className="glass-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal">{value}</p>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
