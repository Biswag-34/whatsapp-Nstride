import type { ShopdeckOrderFields } from "@/features/dispatch/types";

export type ShopdeckField = keyof ShopdeckOrderFields | "orderId";

export const SHOPDECK_FIELD_ALIASES: Record<ShopdeckField, string[]> = {
  address: [
    "Address",
    "Customer Address",
    "Delivery Address",
    "Full Address",
    "Shipping Address",
    "Shipping Address Line 1",
  ],
  amount: [
    "Amount",
    "Final Amount",
    "Net Amount",
    "Order Amount",
    "Order Total",
    "Payable Amount",
    "Total Amount",
  ],
  city: ["City", "Customer City", "Shipping City"],
  courier: ["Courier", "Courier Partner", "Logistics", "Shipping Partner"],
  customerName: ["Customer Name", "Name", "Buyer Name", "Shipping Name"],
  orderDate: ["Order Date", "Created At", "Date", "Order Created At"],
  orderId: ["Order ID", "Order Id", "Order Number", "Order No", "Shopdeck Order ID"],
  paymentType: ["Payment", "Payment Method", "Payment Mode", "Payment Type"],
  phone: ["Phone", "Phone Number", "Mobile", "Mobile Number", "Contact Number"],
  pinCode: ["PIN Code", "Pincode", "Pin", "Postal Code", "Zip", "Zip Code"],
  product: ["Product", "Product Name", "Item", "Item Name", "SKU Name"],
  quantity: ["Quantity", "Qty", "Items", "Product Quantity"],
  size: ["Size", "Variant", "Variant Name", "Product Size"],
  state: ["State", "Customer State", "Shipping State"],
  trackingId: ["Tracking ID", "Tracking Id", "Tracking", "AWB", "AWB Number"],
  trackingUrl: ["Tracking URL", "Tracking Link", "Track URL", "Shipment Tracking Link"],
};

export function normalizeShopdeckHeader(value: string) {
  return value.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}

export function resolveShopdeckField(header: string): ShopdeckField | undefined {
  const normalized = normalizeShopdeckHeader(header);
  const match = Object.entries(SHOPDECK_FIELD_ALIASES).find(([, aliases]) =>
    aliases.some((alias) => normalizeShopdeckHeader(alias) === normalized),
  );

  return match?.[0] as ShopdeckField | undefined;
}

export function getRawValue(row: Record<string, unknown>, field: ShopdeckField) {
  const aliases = SHOPDECK_FIELD_ALIASES[field];
  const entry = Object.entries(row).find(([header]) =>
    aliases.some((alias) => normalizeShopdeckHeader(alias) === normalizeShopdeckHeader(header)),
  );

  return String(entry?.[1] ?? "").trim();
}
