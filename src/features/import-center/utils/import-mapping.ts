import type { ColumnMapping, CrmImportField } from "@/features/import-center/types";

const synonyms: Record<Exclude<CrmImportField, "ignore">, string[]> = {
  customerName: ["customer name", "customer", "name", "buyer name", "full name"],
  mobileNumber: ["phone", "mobile", "mobile number", "contact", "contact number", "phone number"],
  address: ["address", "shipping address", "delivery address", "customer address"],
  product: ["product", "product name", "item", "sku name", "variant name"],
  quantity: ["quantity", "qty", "item quantity"],
  amount: ["amount", "price", "total", "order amount", "paid amount", "total amount"],
  paymentMode: ["payment", "payment mode", "payment method", "prepaid/cod"],
  orderId: ["order id", "order no", "order number", "shopdeck order id", "id"],
  trackingId: ["tracking", "tracking id", "awb", "awb number", "tracking number"],
  courier: ["courier", "shipping partner", "logistics", "carrier"],
  orderDate: ["order date", "date", "created at", "created date"],
  category: ["category", "product category"],
  size: ["size", "variant", "product size"],
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}

export function autoDetectMapping(columns: string[], savedMapping?: ColumnMapping) {
  return columns.reduce<ColumnMapping>((mapping, column) => {
    if (savedMapping?.[column]) {
      mapping[column] = savedMapping[column];
      return mapping;
    }

    const normalizedColumn = normalize(column);
    const match = Object.entries(synonyms).find(([, values]) =>
      values.some((value) => normalize(value) === normalizedColumn),
    );

    mapping[column] = (match?.[0] as CrmImportField | undefined) ?? "ignore";
    return mapping;
  }, {});
}

export function getMappedColumn(mapping: ColumnMapping, field: CrmImportField) {
  return Object.entries(mapping).find(([, mappedField]) => mappedField === field)?.[0];
}
