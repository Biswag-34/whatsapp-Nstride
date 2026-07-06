import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-emerald-900/15">
        <Activity className="size-5" />
      </div>
      <div className={cn("min-w-0", compact && "hidden")}>
        <p className="truncate text-sm font-semibold tracking-normal text-foreground">
          N-Stride
        </p>
        <p className="truncate text-xs text-muted-foreground">Command Center</p>
      </div>
    </div>
  );
}
