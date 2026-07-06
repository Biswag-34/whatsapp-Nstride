import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ValidatedImportRow } from "@/features/import-center/types";
import { cn } from "@/lib/utils";

interface ImportPreviewTableProps {
  columns: string[];
  rows: ValidatedImportRow[];
}

function rowIssueLabel(row: ValidatedImportRow) {
  if (row.errors.length > 0) {
    return row.errors.join(", ");
  }

  if (row.isDuplicate) {
    return "Duplicate Order ID";
  }

  if (row.warnings.length > 0) {
    return row.warnings.join(", ");
  }

  return "Ready";
}

function getCellIssue(column: string, row: ValidatedImportRow) {
  const value = row.source.values[column]?.trim() ?? "";
  const normalizedColumn = column.toLowerCase();

  if (!value) {
    return row.errors.some((error) => error.toLowerCase().includes("missing field")) ||
      normalizedColumn.includes("tracking")
      ? "Missing"
      : "";
  }

  if (
    normalizedColumn.includes("phone") &&
    row.errors.some((error) => error === "Invalid phone number")
  ) {
    return "Invalid phone";
  }

  if (
    normalizedColumn.includes("order") &&
    row.isDuplicate &&
    row.normalized.orderId === value
  ) {
    return "Duplicate";
  }

  return "";
}

export function ImportPreviewTable({ columns, rows }: ImportPreviewTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <Card className="glass-panel overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Preview Table</CardTitle>
          <Badge variant="slate">{rows.length} rows loaded</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl">
              <tr>
                <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                  Row
                </th>
                <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                  Status
                </th>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.source.id}
                  className={cn(
                    "border-b border-border",
                    row.errors.length > 0 && "bg-rose-500/5",
                    row.isDuplicate && "bg-amber-500/5",
                  )}
                >
                  <td className="border-b border-border px-4 py-3 text-muted-foreground">
                    {row.source.rowNumber}
                  </td>
                  <td className="border-b border-border px-4 py-3">
                    <div className="flex min-w-52 items-center gap-2">
                      {row.canImport ? (
                        <CheckCircle2 className="size-4 text-primary" />
                      ) : (
                        <AlertCircle className="size-4 text-amber-600" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          row.canImport ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {rowIssueLabel(row)}
                      </span>
                    </div>
                  </td>
                  {columns.map((column) => {
                    const issue = getCellIssue(column, row);

                    return (
                      <td
                        key={column}
                        className={cn(
                          "border-b border-border px-4 py-3 text-foreground",
                          issue && "bg-rose-500/10 text-rose-700 dark:text-rose-200",
                          issue === "Duplicate" &&
                            "bg-amber-500/10 text-amber-700 dark:text-amber-200",
                        )}
                      >
                        <div className="max-w-60 truncate">
                          {row.source.values[column] || "—"}
                        </div>
                        {issue ? (
                          <div className="mt-1 text-[11px] font-medium uppercase">{issue}</div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
