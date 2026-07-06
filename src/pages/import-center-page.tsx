import { motion } from "framer-motion";
import { Download, FileUp, RotateCcw, Save, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnMappingPanel } from "@/features/import-center/components/column-mapping-panel";
import { ImportHistory } from "@/features/import-center/components/import-history";
import { ImportPreviewTable } from "@/features/import-center/components/import-preview-table";
import { ImportSummaryCards } from "@/features/import-center/components/import-summary-cards";
import { ImportUploadCard } from "@/features/import-center/components/import-upload-card";
import { autoDetectMapping } from "@/features/import-center/utils/import-mapping";
import { parseImportFile } from "@/features/import-center/utils/import-parser";
import { validateImportedRows } from "@/features/import-center/utils/import-validation";
import type {
  ColumnMapping,
  CrmImportField,
  ImportedRow,
  ValidatedImportRow,
} from "@/features/import-center/types";
import type { Order } from "@/features/orders/types";
import { downloadCsv } from "@/features/orders/utils/order-formatters";
import { useImportCenterStore } from "@/stores/use-import-center-store";
import { useOrdersStore } from "@/stores/use-orders-store";

function createOrderFromImport(row: ValidatedImportRow): Order {
  return {
    id: crypto.randomUUID(),
    orderId: row.normalized.orderId,
    customerName: row.normalized.customerName,
    mobileNumber: row.normalized.mobileNumber,
    address: row.normalized.address,
    city: "",
    state: "",
    pinCode: "",
    product: row.normalized.product,
    category: row.normalized.category,
    size: row.normalized.size,
    quantity: row.normalized.quantity,
    amount: row.normalized.amount,
    discount: 0,
    tax: 0,
    total: row.normalized.amount,
    paymentMode: row.normalized.paymentMode,
    courier: row.normalized.courier,
    trackingId: row.normalized.trackingId,
    trackingUrl: row.source.values["Tracking URL"] || "",
    status: "Pending",
    orderDate: row.normalized.orderDate,
    dispatchDate: "",
    expectedDelivery: "",
  };
}

function emptySummary() {
  return {
    imported: 0,
    skipped: 0,
    duplicates: 0,
    errors: 0,
  };
}

export function ImportCenterPage() {
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const orders = useOrdersStore((state) => state.orders);
  const addImportedOrders = useOrdersStore((state) => state.addImportedOrders);
  const savedMapping = useImportCenterStore((state) => state.savedMapping);
  const saveMapping = useImportCenterStore((state) => state.saveMapping);
  const importHistory = useImportCenterStore((state) => state.importHistory);
  const addImportHistory = useImportCenterStore((state) => state.addImportHistory);

  const validation = useMemo(() => {
    if (rows.length === 0) {
      return {
        rows: [],
        summary: emptySummary(),
      };
    }

    return validateImportedRows(rows, mapping, orders);
  }, [mapping, orders, rows]);

  async function handleFileSelected(file: File) {
    setIsParsing(true);
    setParseError("");

    try {
      const parsed = await parseImportFile(file);
      const detectedMapping = autoDetectMapping(parsed.columns, savedMapping);

      setFileName(file.name);
      setColumns(parsed.columns);
      setRows(parsed.rows);
      setMapping(detectedMapping);

      if (parsed.rows.length === 0) {
        setParseError("The selected file does not contain importable rows.");
      }
    } catch {
      setParseError("Unable to parse this file. Please upload a valid CSV or Excel export.");
      setColumns([]);
      setRows([]);
      setMapping({});
    } finally {
      setIsParsing(false);
    }
  }

  function handleMappingChange(column: string, field: CrmImportField) {
    setMapping((current) => ({
      ...current,
      [column]: field,
    }));
  }

  function handleCancel() {
    setFileName("");
    setColumns([]);
    setRows([]);
    setMapping({});
    setParseError("");
  }

  function handleSaveMapping() {
    saveMapping(mapping);
  }

  function handleDownloadErrorReport() {
    const errorRows = validation.rows
      .filter((row) => !row.canImport || row.warnings.length > 0)
      .map((row) => [
        String(row.source.rowNumber),
        row.normalized.orderId,
        row.normalized.customerName,
        row.errors.join("; "),
        row.warnings.join("; "),
      ]);

    downloadCsv("n-stride-import-errors.csv", [
      ["Row", "Order ID", "Customer Name", "Errors", "Warnings"],
      ...errorRows,
    ]);
  }

  function handleImportOrders() {
    const importableRows = validation.rows.filter((row) => row.canImport);
    const importedOrders = importableRows.map(createOrderFromImport);

    addImportedOrders(importedOrders);
    addImportHistory({
      id: crypto.randomUUID(),
      fileName,
      importedAt: new Date().toISOString(),
      totalRows: rows.length,
      imported: importedOrders.length,
      skipped: validation.summary.skipped,
      duplicates: validation.summary.duplicates,
      errors: validation.summary.errors,
    });
    handleCancel();
  }

  const hasPreview = rows.length > 0;
  const canImport = validation.summary.imported > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      <section className="glass-panel rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="success">Shopdeck Import</Badge>
              <span className="text-sm text-muted-foreground">CSV and Excel intake</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              Import Center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review Shopdeck order exports, map columns into CRM fields, validate
              operational issues, and import approved rows into Orders.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={!hasPreview}>
              <RotateCcw />
              Cancel
            </Button>
            <Button type="button" onClick={handleImportOrders} disabled={!canImport}>
              <UploadCloud />
              Import Orders
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ImportUploadCard
            fileName={fileName}
            isParsing={isParsing}
            onFileSelected={handleFileSelected}
          />

          {parseError ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-700 dark:text-rose-200">
              {parseError}
            </div>
          ) : null}

          {hasPreview ? <ImportSummaryCards summary={validation.summary} /> : null}

          <ColumnMappingPanel
            columns={columns}
            mapping={mapping}
            onMappingChange={handleMappingChange}
            onSaveMapping={handleSaveMapping}
          />

          {hasPreview ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleSaveMapping}>
                <Save />
                Save Mapping
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadErrorReport}
                disabled={validation.summary.errors === 0 && validation.summary.duplicates === 0}
              >
                <Download />
                Download Error Report
              </Button>
              <Button type="button" onClick={handleImportOrders} disabled={!canImport}>
                <FileUp />
                Import Orders
              </Button>
            </div>
          ) : null}

          <ImportPreviewTable columns={columns} rows={validation.rows} />
        </div>

        <div className="space-y-5">
          <ImportHistory history={importHistory} />
          <div className="glass-panel rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold tracking-normal text-foreground">
              Import History
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Import runs, saved mappings, and validation summaries are stored locally
              today. The feature boundary is ready for a future API-backed import
              service.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
