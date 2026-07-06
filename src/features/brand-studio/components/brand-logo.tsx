import { Activity } from "lucide-react";

interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-emerald-950/15">
        <Activity className="size-5" />
      </div>
      {!compact ? (
        <div>
          <p className="text-base font-semibold tracking-normal text-foreground">N-Stride</p>
          <p className="text-xs text-muted-foreground">Comfort • Protection</p>
        </div>
      ) : null}
    </div>
  );
}
