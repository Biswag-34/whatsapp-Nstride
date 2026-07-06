import Papa from "papaparse";
import * as XLSX from "xlsx";

import type { PaymentType, ShopdeckOrderFields } from "@/features/dispatch/types";
import { getRawValue } from "@/features/dispatch/services/shopdeck-columns";

export interface ShopdeckParsedRow {
  fields: ShopdeckOrderFields;
  orderId: string;
  raw: Record<string, unknown>;
  rowNumber: number;
}

export interface ShopdeckParseResult {
  headers: string[];
  rows: ShopdeckParsedRow[];
}

function normalizePayment(input: string): PaymentType {
  const lower = input.toLowerCase();

  if (lower.includes("cod") || lower.includes("cash")) {
    return "COD";
  }

  if (lower.includes("prepaid") || lower.includes("paid") || lower.includes("upi")) {
    return "Prepaid";
  }

  return "Unknown";
}

function toAmount(input: string) {
  const parsed = Number(input.replace(/[₹,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function toQuantity(input: string) {
  const parsed = Number(input.replace(/[,\s]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function toFields(row: Record<string, unknown>): ShopdeckOrderFields {
  return {
    address: getRawValue(row, "address"),
    amount: toAmount(getRawValue(row, "amount")),
    city: getRawValue(row, "city"),
    courier: getRawValue(row, "courier"),
    customerName: getRawValue(row, "customerName"),
    orderDate: getRawValue(row, "orderDate") || new Date().toISOString().slice(0, 10),
    paymentType: normalizePayment(getRawValue(row, "paymentType")),
    phone: getRawValue(row, "phone"),
    pinCode: getRawValue(row, "pinCode"),
    product: getRawValue(row, "product"),
    quantity: toQuantity(getRawValue(row, "quantity")),
    size: getRawValue(row, "size"),
    state: getRawValue(row, "state"),
    trackingId: getRawValue(row, "trackingId"),
    trackingUrl: getRawValue(row, "trackingUrl"),
  };
}

function rowsToParsed(rows: Array<Record<string, unknown>>, headers: string[]): ShopdeckParseResult {
  return {
    headers,
    rows: rows.map((row, index) => ({
      fields: toFields(row),
      orderId: getRawValue(row, "orderId"),
      raw: row,
      rowNumber: index + 2,
    })),
  };
}

export async function parseShopdeckFile(file: File): Promise<ShopdeckParseResult> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const headers = rows[0] ? Object.keys(rows[0]) : [];

    return rowsToParsed(rows, headers);
  }

  const text = await file.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      complete: (result) => {
        const rows = result.data.filter((row) =>
          Object.values(row).some((cell) => String(cell ?? "").trim().length > 0),
        );
        resolve(rowsToParsed(rows, result.meta.fields ?? []));
      },
      error: reject,
      header: true,
      skipEmptyLines: true,
    });
  });
}
