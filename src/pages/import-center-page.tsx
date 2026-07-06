import { motion } from "framer-motion";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useDispatchStore } from "@/stores/use-dispatch-store";

export function ImportCenterPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const importFile = useDispatchStore((state) => state.importFile);
  const isLoading = useDispatchStore((state) => state.isLoading);
  const lastError = useDispatchStore((state) => state.lastError);
  const lastImportSession = useDispatchStore((state) => state.lastImportSession);
  const importSessions = useDispatchStore((state) => state.importSessions);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (file) {
      await importFile(file);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Import Center</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Built for Shopdeck Order Summary exports with Customer Number, AWB NO., Track Link, Courier Partner, and Final Selling Price columns.
        </p>
      </div>
      <Card className="glass-panel">
        <CardContent className="p-5">
          <div
            className={`flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/10" : "border-border bg-background/35"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void handleFiles(event.dataTransfer.files);
            }}
          >
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Drop Shopdeck Order Summary CSV</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Order ID is the primary key. Customer Number is used as phone, AWB NO. as tracking, and changed Shopdeck rows update existing orders.
            </p>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={(event) => void handleFiles(event.target.files)}
            />
            <Button className="mt-5" onClick={() => inputRef.current?.click()} disabled={isLoading}>
              <FileSpreadsheet />
              {isLoading ? "Importing..." : "Browse Files"}
            </Button>
            {lastError ? <p className="mt-4 text-sm text-red-500">{lastError}</p> : null}
          </div>
        </CardContent>
      </Card>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lastImportSession ? (
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="grid gap-3 text-sm sm:grid-cols-4">
                <span className="rounded-lg bg-primary/10 p-3 text-primary">
                  Imported: {lastImportSession.imported}
                </span>
                <span className="rounded-lg bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-200">
                  Updated: {lastImportSession.updated}
                </span>
                <span className="rounded-lg bg-muted/70 p-3 text-muted-foreground">
                  Skipped: {lastImportSession.skipped}
                </span>
                <span className="rounded-lg bg-red-500/10 p-3 text-red-600 dark:text-red-300">
                  Errors: {lastImportSession.errors}
                </span>
              </div>
              {lastImportSession.validationErrors.length > 0 ? (
                <div className="mt-4 max-h-64 overflow-auto rounded-lg border border-border">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Row</th>
                        <th className="px-3 py-2">Order ID</th>
                        <th className="px-3 py-2">Field</th>
                        <th className="px-3 py-2">Issue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastImportSession.validationErrors.slice(0, 50).map((issue) => (
                        <tr key={`${issue.rowNumber}-${issue.field}-${issue.message}`} className="border-t border-border">
                          <td className="px-3 py-2">{issue.rowNumber}</td>
                          <td className="px-3 py-2">{issue.orderId || "Missing"}</td>
                          <td className="px-3 py-2">{issue.field}</td>
                          <td className="px-3 py-2 text-red-600 dark:text-red-300">{issue.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {lastImportSession.sourceHeaders.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Detected Shopdeck Columns</p>
                  <div className="flex flex-wrap gap-2">
                    {lastImportSession.sourceHeaders.map((header) => (
                      <span key={header} className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {importSessions.slice(0, 8).map((session) => (
            <div
              key={session.id}
              className="grid gap-3 rounded-lg border border-border bg-background/45 p-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <p className="font-medium">{session.fileName}</p>
                <p className="text-muted-foreground">{formatDate(session.importedAt)}</p>
              </div>
              <p className="text-muted-foreground">
                {session.imported} imported - {session.updated} updated - {session.skipped} skipped - {session.errors} errors - {session.durationMs}ms
              </p>
            </div>
          ))}
          {importSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Import history will appear here.</p>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
