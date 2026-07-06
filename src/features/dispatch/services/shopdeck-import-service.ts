import type { DispatchOrder } from "@/features/dispatch/types";
import { createExistingOrderIndex, findDuplicateOrderIds } from "@/features/dispatch/services/duplicate-detection-service";
import { createImportHistoryEvent, createImportSession } from "@/features/dispatch/services/import-history-service";
import { parseShopdeckFile } from "@/features/dispatch/services/shopdeck-parser";
import { applyShopdeckRows } from "@/features/dispatch/services/update-engine";
import { validateShopdeckRows } from "@/features/dispatch/services/validation-service";

export async function importShopdeckFile(file: File, existingOrders: DispatchOrder[]) {
  const startedAt = performance.now();
  const timestamp = new Date().toISOString();
  const importSessionId = crypto.randomUUID();
  const parsed = await parseShopdeckFile(file);
  const validationErrors = validateShopdeckRows(parsed.rows);
  const invalidRows = new Set(
    validationErrors
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.rowNumber),
  );
  const validRows = parsed.rows.filter((row) => !invalidRows.has(row.rowNumber));
  const duplicateOrderIds = findDuplicateOrderIds(parsed.rows);
  const seen = new Set<string>();
  const uniqueValidRows = validRows.filter((row) => {
    const key = row.orderId.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
  const existingByOrderId = createExistingOrderIndex(existingOrders);
  const engineResult = applyShopdeckRows(
    uniqueValidRows,
    existingByOrderId,
    importSessionId,
    timestamp,
    parsed.headers,
  );
  const session = createImportSession({
    duplicateOrderIds,
    durationMs: Math.round(performance.now() - startedAt),
    errors: validationErrors.filter((issue) => issue.severity === "error").length,
    fileName: file.name,
    id: importSessionId,
    imported: engineResult.imported,
    skipped: engineResult.skipped + parsed.rows.length - uniqueValidRows.length,
    sourceHeaders: parsed.headers,
    timestamp,
    totalRows: parsed.rows.length,
    updated: engineResult.updated,
    validationErrors,
  });

  return {
    dispatchHistory: [createImportHistoryEvent(session), ...engineResult.historyEvents],
    orders: engineResult.orders,
    session,
  };
}
