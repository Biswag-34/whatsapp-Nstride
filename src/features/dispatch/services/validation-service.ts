import type { ImportValidationIssue } from "@/features/dispatch/types";
import type { ShopdeckParsedRow } from "@/features/dispatch/services/shopdeck-parser";

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  return digits.length >= 10 && digits.length <= 13;
}

export function validateShopdeckRows(rows: ShopdeckParsedRow[]) {
  const issues: ImportValidationIssue[] = [];
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const key = row.orderId.trim().toLowerCase();

    if (key) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  rows.forEach((row) => {
    if (!row.orderId) {
      issues.push({
        field: "Order ID",
        message: "Missing Order ID",
        rowNumber: row.rowNumber,
        severity: "error",
      });
    } else if ((counts.get(row.orderId.toLowerCase()) ?? 0) > 1) {
      issues.push({
        field: "Order ID",
        message: "Duplicate Order ID inside CSV",
        orderId: row.orderId,
        rowNumber: row.rowNumber,
        severity: "warning",
      });
    }

    if (!row.fields.customerName) {
      issues.push({
        field: "Customer Name",
        message: "Missing Customer Name",
        orderId: row.orderId,
        rowNumber: row.rowNumber,
        severity: "error",
      });
    }

    if (!row.fields.phone) {
      issues.push({
        field: "Phone",
        message: "Missing Phone",
        orderId: row.orderId,
        rowNumber: row.rowNumber,
        severity: "error",
      });
    } else if (!isValidPhone(row.fields.phone)) {
      issues.push({
        field: "Phone",
        message: "Invalid Phone",
        orderId: row.orderId,
        rowNumber: row.rowNumber,
        severity: "error",
      });
    }

    if (!Number.isFinite(row.fields.amount) || row.fields.amount < 0) {
      issues.push({
        field: "Amount",
        message: "Invalid Amount",
        orderId: row.orderId,
        rowNumber: row.rowNumber,
        severity: "error",
      });
    }
  });

  return issues;
}
