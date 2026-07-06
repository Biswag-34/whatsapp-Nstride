import type { PaymentMode } from "@/features/orders/types";

export type CrmImportField =
  | "ignore"
  | "customerName"
  | "mobileNumber"
  | "address"
  | "product"
  | "quantity"
  | "amount"
  | "paymentMode"
  | "orderId"
  | "trackingId"
  | "courier"
  | "orderDate"
  | "category"
  | "size";

export interface ImportedRow {
  id: string;
  rowNumber: number;
  values: Record<string, string>;
}

export type ColumnMapping = Record<string, CrmImportField>;

export interface ValidatedImportRow {
  source: ImportedRow;
  normalized: {
    customerName: string;
    mobileNumber: string;
    address: string;
    product: string;
    quantity: number;
    amount: number;
    paymentMode: PaymentMode;
    orderId: string;
    trackingId: string;
    courier: string;
    orderDate: string;
    category: string;
    size: string;
  };
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  canImport: boolean;
}

export interface ImportSummary {
  imported: number;
  skipped: number;
  duplicates: number;
  errors: number;
}

export interface ImportHistoryItem {
  id: string;
  fileName: string;
  importedAt: string;
  totalRows: number;
  imported: number;
  skipped: number;
  duplicates: number;
  errors: number;
}
