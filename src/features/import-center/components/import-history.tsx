import { Clock3, FileSpreadsheet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImportHistoryItem } from "@/features/import-center/types";
import { formatDate } from "@/features/orders/utils/order-formatters";

interface ImportHistoryProps {
  history: ImportHistoryItem[];
}

export function ImportHistory({ history }: ImportHistoryProps) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Recent Imports</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <Clock3 className="size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No import history yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Completed imports will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-background/55 p-3 dark:bg-white/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileSpreadsheet className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.fileName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(item.importedAt)} • {item.imported} imported • {item.skipped} skipped
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
