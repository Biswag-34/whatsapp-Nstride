import type { DispatchHistoryEvent, ImportSession } from "@/features/dispatch/types";

interface CreateImportSessionInput {
  duplicateOrderIds: string[];
  durationMs: number;
  errors: number;
  fileName: string;
  id: string;
  imported: number;
  skipped: number;
  sourceHeaders: string[];
  timestamp: string;
  totalRows: number;
  updated: number;
  validationErrors: ImportSession["validationErrors"];
}

export function createImportSession(input: CreateImportSessionInput): ImportSession {
  return {
    duplicateOrderIds: input.duplicateOrderIds,
    durationMs: input.durationMs,
    errors: input.errors,
    fileName: input.fileName,
    id: input.id,
    imported: input.imported,
    importedAt: input.timestamp,
    skipped: input.skipped,
    sourceHeaders: input.sourceHeaders,
    totalRows: input.totalRows,
    updated: input.updated,
    validationErrors: input.validationErrors,
  };
}

export function createImportHistoryEvent(session: ImportSession): DispatchHistoryEvent {
  return {
    createdAt: session.importedAt,
    description: `${session.imported} imported, ${session.updated} updated, ${session.skipped} skipped, ${session.errors} errors`,
    id: crypto.randomUUID(),
    importSessionId: session.id,
    title: "Shopdeck import completed",
    type: "import",
  };
}
