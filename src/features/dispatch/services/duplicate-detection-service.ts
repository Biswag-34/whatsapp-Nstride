import type { DispatchOrder } from "@/features/dispatch/types";
import type { ShopdeckParsedRow } from "@/features/dispatch/services/shopdeck-parser";

export function createExistingOrderIndex(orders: DispatchOrder[]) {
  return new Map(orders.map((order) => [order.orderId.toLowerCase(), order]));
}

export function findDuplicateOrderIds(rows: ShopdeckParsedRow[]) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    if (row.orderId) {
      const key = row.orderId.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([orderId]) => orderId);
}
