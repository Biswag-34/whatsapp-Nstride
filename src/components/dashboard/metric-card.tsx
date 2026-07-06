import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  trend: string;
  icon: LucideIcon;
  tone: string;
  index: number;
}

const toneStyles: Record<string, string> = {
  primary: "bg-primary/10 text-primary ring-primary/15",
  amber: "bg-amber-500/10 text-amber-700 ring-amber-500/15 dark:text-amber-200",
  sky: "bg-sky-500/10 text-sky-700 ring-sky-500/15 dark:text-sky-200",
  slate: "bg-slate-900/10 text-slate-800 ring-slate-900/10 dark:bg-white/10 dark:text-slate-100",
};

export function MetricCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  tone,
  index,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Card className="glass-panel overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
              {value}
            </p>
          </div>
          <div className={cn("rounded-xl p-2.5 ring-1", toneStyles[tone])}>
            <Icon className="size-5" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-sm">
          <span className="rounded-md bg-secondary/12 px-2 py-1 font-medium text-primary dark:text-emerald-100">
            {delta}
          </span>
          <span className="text-muted-foreground">{trend}</span>
        </div>
      </Card>
    </motion.div>
  );
}
