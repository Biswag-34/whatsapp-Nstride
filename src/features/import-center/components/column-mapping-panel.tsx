import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crmImportFields } from "@/features/import-center/constants";
import type { ColumnMapping, CrmImportField } from "@/features/import-center/types";

interface ColumnMappingPanelProps {
  columns: string[];
  mapping: ColumnMapping;
  onMappingChange: (column: string, field: CrmImportField) => void;
  onSaveMapping: () => void;
}

export function ColumnMappingPanel({
  columns,
  mapping,
  onMappingChange,
  onSaveMapping,
}: ColumnMappingPanelProps) {
  if (columns.length === 0) {
    return null;
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Column Mapping</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={onSaveMapping}>
            <Save />
            Save Mapping
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {columns.map((column) => (
            <label
              key={column}
              className="grid gap-2 rounded-xl border border-border bg-background/55 p-3 dark:bg-white/[0.03]"
            >
              <span className="truncate text-sm font-medium text-foreground">{column}</span>
              <select
                value={mapping[column] ?? "ignore"}
                onChange={(event) =>
                  onMappingChange(column, event.target.value as CrmImportField)
                }
                className="h-10 rounded-lg border border-input bg-white/70 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/[0.04]"
              >
                {crmImportFields.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
