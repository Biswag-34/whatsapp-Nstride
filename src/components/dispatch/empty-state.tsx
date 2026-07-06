import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}

export function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <Card className="glass-panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
