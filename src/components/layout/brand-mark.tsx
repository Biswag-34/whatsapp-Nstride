import { Activity } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-emerald-900/15">
        <Activity className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-normal text-foreground">
          N-Stride
        </p>
        <p className="truncate text-xs text-muted-foreground">Dispatch Center</p>
      </div>
    </div>
  );
}
