import Papa from "papaparse";
import * as XLSX from "xlsx";

import type { PaymentType, ShopdeckOrderFields } from "@/features/dispatch/types";
import { getRawValue } from "@/features/dispatch/services/shopdeck-columns";

export interface ShopdeckParsedRow {
  fields: ShopdeckOrderFields;
  orderId: string;
  raw: Record<string, unknown>;
  sourceRow: Record<string, string>;
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
  const parsed = Number(input.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function toQuantity(input: string) {
  const parsed = Number(input.replace(/[,\s]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeDate(input: string) {
  const value = input.trim();
  const match = value.match(/^(\d{1,2}:\d{2})\s*(AM|PM),\s*(\d{1,2})\/(\d{1,2})\/(\d{4})$/i);

  if (!match) {
    return value || new Date().toISOString().slice(0, 10);
  }

  const [, time, meridiem, day, month, year] = match;
  const [hourRaw, minute] = time.split(":").map(Number);
  const hour =
    meridiem.toLowerCase() === "pm" && hourRaw < 12
      ? hourRaw + 12
      : meridiem.toLowerCase() === "am" && hourRaw === 12
        ? 0
        : hourRaw;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function extractAddressParts(address: string) {
  const match = address.match(/,\s*([^,]+),\s*([A-Za-z ]+)\s*-\s*(\d{6})\s*$/);

  return {
    city: match?.[1]?.trim() ?? "",
    pinCode: match?.[3]?.trim() ?? "",
    state: match?.[2]?.trim() ?? "",
  };
}

function toSourceRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()]),
  );
}

function toFields(row: Record<string, unknown>): ShopdeckOrderFields {
  const address = getRawValue(row, "address");
  const addressParts = extractAddressParts(address);

  return {
    address,
    amount: toAmount(getRawValue(row, "amount")),
    city: getRawValue(row, "city") || addressParts.city,
    courier: getRawValue(row, "courier"),
    customerName: getRawValue(row, "customerName"),
    orderDate: normalizeDate(getRawValue(row, "orderDate")),
    paymentType: normalizePayment(getRawValue(row, "paymentType")),
    phone: getRawValue(row, "phone"),
    pinCode: getRawValue(row, "pinCode") || addressParts.pinCode,
    product: getRawValue(row, "product"),
    quantity: toQuantity(getRawValue(row, "quantity")),
    size: getRawValue(row, "size"),
    state: getRawValue(row, "state") || addressParts.state,
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
      sourceRow: toSourceRow(row),
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
