import Papa from "papaparse";
import * as XLSX from "xlsx";

import type {
  ActivityEvent,
  DispatchOrder,
  ImportSession,
  PaymentType,
} from "@/features/dispatch/types";

interface ParsedImport {
  activities: ActivityEvent[];
  orders: DispatchOrder[];
  session: ImportSession;
}

function value(row: Record<string, unknown>, keys: string[]) {
  const entry = Object.entries(row).find(([key]) =>
    keys.some((candidate) => normalizeHeader(key) === normalizeHeader(candidate)),
  );

  return String(entry?.[1] ?? "").trim();
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
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
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNumber(input: string) {
  const parsed = Number(input.replace(/[,\s]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function rowHash(row: Record<string, unknown>) {
  return JSON.stringify(row);
}

function getOrderId(row: Record<string, unknown>) {
  return value(row, ["Order ID", "Order Number", "Shopdeck Order ID", "Order No", "ID"]);
}

function toDispatchOrder(
  row: Record<string, unknown>,
  importSessionId: string,
  existing?: DispatchOrder,
): DispatchOrder {
  const timestamp = new Date().toISOString();
  const shopdeckOrderId = getOrderId(row);

  return {
    id: existing?.id ?? crypto.randomUUID(),
    address: value(row, ["Address", "Shipping Address", "Delivery Address"]),
    amount: toAmount(value(row, ["Amount", "Total Amount", "Order Amount", "Price"])),
    courier: value(row, ["Courier", "Shipping Partner", "Carrier", "Logistics"]),
    createdAt: existing?.createdAt ?? timestamp,
    customerName: value(row, ["Customer Name", "Name", "Buyer Name"]),
    importSessionId,
    orderDate:
      value(row, ["Order Date", "Created At", "Date"]) || new Date().toISOString().slice(0, 10),
    paymentType: normalizePayment(value(row, ["Payment", "Payment Mode", "Payment Method"])),
    phone: value(row, ["Phone", "Mobile", "Mobile Number", "Contact Number"]),
    product: value(row, ["Product", "Product Name", "Item", "SKU"]),
    quantity: toNumber(value(row, ["Quantity", "Qty", "Items"])),
    rowHash: rowHash(row),
    shopdeckOrderId,
    size: value(row, ["Size", "Variant", "Product Size"]),
    status: existing?.status ?? "pending_whatsapp",
    trackingId: value(row, ["Tracking ID", "Tracking", "AWB", "AWB Number"]),
    trackingUrl: value(row, ["Tracking URL", "Track URL", "Tracking Link"]),
    updatedAt: timestamp,
    whatsappSentAt: existing?.whatsappSentAt,
  };
}

export async function parseOrderFile(file: File, existingOrders: DispatchOrder[]): Promise<ParsedImport> {
  const rows = await parseRows(file);
  const timestamp = new Date().toISOString();
  const sessionId = crypto.randomUUID();
  const byShopdeckId = new Map(
    existingOrders.map((order) => [order.shopdeckOrderId.toLowerCase(), order]),
  );
  let inserted = 0;
  let updated = 0;
  let duplicates = 0;
  let errors = 0;
  const seen = new Set<string>();
  const orders: DispatchOrder[] = [];

  rows.forEach((row) => {
    const shopdeckOrderId = getOrderId(row);

    if (!shopdeckOrderId) {
      errors += 1;
      return;
    }

    const key = shopdeckOrderId.toLowerCase();
    const existing = byShopdeckId.get(key);

    if (seen.has(key)) {
      duplicates += 1;
      return;
    }

    seen.add(key);

    if (existing && existing.rowHash === rowHash(row)) {
      duplicates += 1;
      return;
    }

    if (existing) {
      updated += 1;
    } else {
      inserted += 1;
    }

    orders.push(toDispatchOrder(row, sessionId, existing));
  });

  const session: ImportSession = {
    id: sessionId,
    duplicates,
    errors,
    fileName: file.name,
    importedAt: timestamp,
    inserted,
    totalRows: rows.length,
    updated,
  };

  const activities: ActivityEvent[] = [
    {
      id: crypto.randomUUID(),
      createdAt: timestamp,
      description: `${inserted} inserted, ${updated} updated, ${duplicates} duplicates`,
      title: "Shopdeck import completed",
      type: "import",
    },
  ];

  return { activities, orders, session };
}

async function parseRows(file: File): Promise<Array<Record<string, unknown>>> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  }

  const text = await file.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      complete: (result) => resolve(result.data.filter((row) => Object.keys(row).length > 0)),
      error: reject,
      header: true,
      skipEmptyLines: true,
    });
  });
}
