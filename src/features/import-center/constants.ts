import type { CrmImportField } from "@/features/import-center/types";

export const crmImportFields: Array<{
  label: string;
  value: CrmImportField;
  required?: boolean;
}> = [
  { label: "Ignore column", value: "ignore" },
  { label: "Customer Name", value: "customerName", required: true },
  { label: "Phone", value: "mobileNumber", required: true },
  { label: "Address", value: "address", required: true },
  { label: "Product", value: "product", required: true },
  { label: "Quantity", value: "quantity", required: true },
  { label: "Amount", value: "amount", required: true },
  { label: "Payment", value: "paymentMode", required: true },
  { label: "Order ID", value: "orderId", required: true },
  { label: "Tracking", value: "trackingId", required: true },
  { label: "Courier", value: "courier", required: true },
  { label: "Order Date", value: "orderDate", required: true },
  { label: "Category", value: "category" },
  { label: "Size", value: "size" },
];

export const requiredImportFields: CrmImportField[] = crmImportFields
  .filter((field) => field.required)
  .map((field) => field.value);

export const importFieldLabels = crmImportFields.reduce(
  (labels, field) => ({
    ...labels,
    [field.value]: field.label,
  }),
  {} as Record<CrmImportField, string>,
);
