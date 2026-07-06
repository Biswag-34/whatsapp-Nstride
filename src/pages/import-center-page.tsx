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
          Import Shopdeck CSV or Excel files into the local dispatch queue.
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
            <h2 className="mt-4 text-lg font-semibold">Drop latest Shopdeck Order Summary</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              CSV, XLS, and XLSX are supported. Duplicate order IDs are skipped and changed orders are updated.
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
                {session.inserted} imported - {session.updated} updated - {session.duplicates} duplicates - {session.errors} errors
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
