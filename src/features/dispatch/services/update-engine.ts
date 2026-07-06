import type {
  DispatchHistoryEvent,
  DispatchOrder,
  OrderChangeLogEntry,
  ShopdeckOrderFields,
} from "@/features/dispatch/types";
import type { ShopdeckParsedRow } from "@/features/dispatch/services/shopdeck-parser";

interface UpdateEngineResult {
  historyEvents: DispatchHistoryEvent[];
  imported: number;
  orders: DispatchOrder[];
  skipped: number;
  updated: number;
}

const COMPARABLE_FIELDS: Array<keyof ShopdeckOrderFields> = [
  "customerName",
  "phone",
  "address",
  "city",
  "state",
  "pinCode",
  "product",
  "size",
  "quantity",
  "amount",
  "paymentType",
  "courier",
  "trackingId",
  "trackingUrl",
  "orderDate",
];

const FIELD_LABELS: Record<keyof ShopdeckOrderFields, string> = {
  address: "Address",
  amount: "Amount",
  city: "City",
  courier: "Courier",
  customerName: "Customer Name",
  orderDate: "Order Date",
  paymentType: "Payment",
  phone: "Phone",
  pinCode: "PIN Code",
  product: "Product",
  quantity: "Quantity",
  size: "Size",
  state: "State",
  trackingId: "Tracking ID",
  trackingUrl: "Tracking URL",
};

function fingerprint(fields: ShopdeckOrderFields) {
  return JSON.stringify(COMPARABLE_FIELDS.map((field) => [field, fields[field] ?? ""]));
}

function sourceFingerprint(sourceRow: Record<string, string>) {
  return JSON.stringify(
    Object.entries(sourceRow)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, value ?? ""]),
  );
}

function changeTitle(field: keyof ShopdeckOrderFields, previous: unknown, next: unknown) {
  const label = FIELD_LABELS[field];

  if ((previous === "" || previous === undefined || previous === null) && next) {
    return `${label} Added`;
  }

  return `${label} Changed`;
}

function createChangeLogEntry(
  title: string,
  description: string,
  timestamp: string,
  importSessionId: string,
  field?: keyof ShopdeckOrderFields,
): OrderChangeLogEntry {
  return {
    createdAt: timestamp,
    description,
    field,
    id: crypto.randomUUID(),
    importSessionId,
    title,
  };
}

function toHistoryEvent(
  orderId: string,
  change: OrderChangeLogEntry,
): DispatchHistoryEvent {
  return {
    createdAt: change.createdAt,
    description: change.description,
    id: crypto.randomUUID(),
    importSessionId: change.importSessionId,
    orderId,
    title: change.title,
    type: change.title === "Imported" ? "import" : "update",
  };
}

function createOrder(
  row: ShopdeckParsedRow,
  importSessionId: string,
  timestamp: string,
  sourceHeaders: string[],
): DispatchOrder {
  const imported = createChangeLogEntry(
    "Imported",
    `Order #${row.orderId} imported from Shopdeck.`,
    timestamp,
    importSessionId,
  );

  return {
    ...row.fields,
    changeLog: [imported],
    createdAt: timestamp,
    fieldFingerprint: fingerprint(row.fields),
    id: row.orderId,
    importSessionId,
    orderId: row.orderId,
    shopdeckOrderId: row.orderId,
    sourceRow: row.sourceRow,
    sourceRowFingerprint: sourceFingerprint(row.sourceRow),
    sourceHeaders,
    status: "pending_dispatch",
    updatedAt: timestamp,
  };
}

export function applyShopdeckRows(
  rows: ShopdeckParsedRow[],
  existingByOrderId: Map<string, DispatchOrder>,
  importSessionId: string,
  timestamp: string,
  sourceHeaders: string[],
): UpdateEngineResult {
  const orders: DispatchOrder[] = [];
  const historyEvents: DispatchHistoryEvent[] = [];
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  rows.forEach((row) => {
    const existing = existingByOrderId.get(row.orderId.toLowerCase());

    if (!existing) {
      const order = createOrder(row, importSessionId, timestamp, sourceHeaders);
      imported += 1;
      orders.push(order);
      historyEvents.push(toHistoryEvent(order.orderId, order.changeLog[0]));
      return;
    }

    const changes = COMPARABLE_FIELDS.flatMap((field) => {
      const previous = existing[field];
      const next = row.fields[field];

      if (String(previous ?? "") === String(next ?? "")) {
        return [];
      }

      return [
        createChangeLogEntry(
          changeTitle(field, previous, next),
          `${FIELD_LABELS[field]} changed from "${String(previous ?? "Empty")}" to "${String(next ?? "Empty")}".`,
          timestamp,
          importSessionId,
          field,
        ),
      ];
    });

    if (changes.length === 0 || existing.fieldFingerprint === fingerprint(row.fields)) {
      if (existing.sourceRowFingerprint === sourceFingerprint(row.sourceRow)) {
        skipped += 1;
        return;
      }

      changes.push(
        createChangeLogEntry(
          "Shopdeck Row Updated",
          "One or more non-dispatch Shopdeck columns changed.",
          timestamp,
          importSessionId,
        ),
      );
    }

    const order: DispatchOrder = {
      ...existing,
      ...row.fields,
      changeLog: [...existing.changeLog, ...changes],
      fieldFingerprint: fingerprint(row.fields),
      importSessionId,
      sourceRow: row.sourceRow,
      sourceRowFingerprint: sourceFingerprint(row.sourceRow),
      sourceHeaders,
      status: "pending_dispatch",
      updatedAt: timestamp,
    };

    updated += 1;
    orders.push(order);
    historyEvents.push(...changes.map((change) => toHistoryEvent(order.orderId, change)));
  });

  return { historyEvents, imported, orders, skipped, updated };
}
