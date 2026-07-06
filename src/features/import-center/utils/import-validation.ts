import type { ColumnMapping, ImportedRow, ImportSummary, ValidatedImportRow } from "@/features/import-center/types";
import { requiredImportFields } from "@/features/import-center/constants";
import { getMappedColumn } from "@/features/import-center/utils/import-mapping";
import type { Order, PaymentMode } from "@/features/orders/types";

function valueFor(row: ImportedRow, mapping: ColumnMapping, field: Parameters<typeof getMappedColumn>[1]) {
  const column = getMappedColumn(mapping, field);

  return column ? row.values[column]?.trim() ?? "" : "";
}

function toNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/[₹,\s]/g, ""));

  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePayment(value: string): PaymentMode {
  const normalized = value.toLowerCase();

  if (normalized.includes("cod") || normalized.includes("cash")) {
    return "COD";
  }

  if (normalized.includes("upi")) {
    return "UPI";
  }

  if (normalized.includes("card")) {
    return "Card";
  }

  return "Prepaid";
}

function normalizeDate(value: string) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length >= 10 && digits.length <= 13;
}

export function validateImportedRows(
  rows: ImportedRow[],
  mapping: ColumnMapping,
  existingOrders: Order[],
) {
  const existingOrderIds = new Set(existingOrders.map((order) => order.orderId.toLowerCase()));
  const seenOrderIds = new Set<string>();
  const mappedFields = new Set(Object.values(mapping));
  const missingMappedFields = requiredImportFields.filter((field) => !mappedFields.has(field));

  const validatedRows = rows.map<ValidatedImportRow>((row) => {
    const orderId = valueFor(row, mapping, "orderId");
    const trackingId = valueFor(row, mapping, "trackingId");
    const mobileNumber = valueFor(row, mapping, "mobileNumber");
    const normalizedOrderId = orderId.toLowerCase();
    const duplicate =
      normalizedOrderId.length > 0 &&
      (seenOrderIds.has(normalizedOrderId) || existingOrderIds.has(normalizedOrderId));
    const errors: string[] = [];
    const warnings: string[] = [];

    missingMappedFields.forEach((field) => {
      errors.push(`Missing mapping: ${field}`);
    });

    requiredImportFields.forEach((field) => {
      if (!valueFor(row, mapping, field)) {
        errors.push(`Missing field: ${field}`);
      }
    });

    if (mobileNumber && !isValidPhone(mobileNumber)) {
      errors.push("Invalid phone number");
    }

    if (duplicate) {
      warnings.push("Duplicate Order ID");
    }

    if (!trackingId) {
      errors.push("Empty tracking number");
    }

    if (normalizedOrderId) {
      seenOrderIds.add(normalizedOrderId);
    }

    return {
      source: row,
      normalized: {
        customerName: valueFor(row, mapping, "customerName"),
        mobileNumber,
        address: valueFor(row, mapping, "address"),
        product: valueFor(row, mapping, "product"),
        quantity: Math.max(1, toNumber(valueFor(row, mapping, "quantity"), 1)),
        amount: toNumber(valueFor(row, mapping, "amount"), 0),
        paymentMode: normalizePayment(valueFor(row, mapping, "paymentMode")),
        orderId,
        trackingId,
        courier: valueFor(row, mapping, "courier"),
        orderDate: normalizeDate(valueFor(row, mapping, "orderDate")),
        category: valueFor(row, mapping, "category") || "Shopdeck",
        size: valueFor(row, mapping, "size") || "Free",
      },
      errors,
      warnings,
      isDuplicate: duplicate,
      canImport: errors.length === 0 && !duplicate,
    };
  });

  const summary = validatedRows.reduce<ImportSummary>(
    (current, row) => ({
      imported: current.imported + (row.canImport ? 1 : 0),
      skipped: current.skipped + (row.canImport ? 0 : 1),
      duplicates: current.duplicates + (row.isDuplicate ? 1 : 0),
      errors: current.errors + row.errors.length,
    }),
    {
      imported: 0,
      skipped: 0,
      duplicates: 0,
      errors: 0,
    },
  );

  return { rows: validatedRows, summary };
}
