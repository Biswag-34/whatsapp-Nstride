export type DispatchOrderStatus =
  | "pending_whatsapp"
  | "whatsapp_sent"
  | "delivered"
  | "cancelled";

export type PaymentType = "COD" | "Prepaid" | "Unknown";

export interface DispatchOrder {
  id: string;
  shopdeckOrderId: string;
  customerName: string;
  phone: string;
  address: string;
  product: string;
  amount: number;
  paymentType: PaymentType;
  courier: string;
  trackingId: string;
  trackingUrl: string;
  orderDate: string;
  quantity: number;
  size: string;
  status: DispatchOrderStatus;
  importSessionId: string;
  rowHash: string;
  createdAt: string;
  updatedAt: string;
  whatsappSentAt?: string;
}

export interface ImportSession {
  id: string;
  fileName: string;
  importedAt: string;
  totalRows: number;
  inserted: number;
  updated: number;
  duplicates: number;
  errors: number;
}

export interface ActivityEvent {
  id: string;
  type: "import" | "update" | "whatsapp" | "system";
  title: string;
  description: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  body: string;
  isDefault: boolean;
  updatedAt: string;
}

export interface AppSettings {
  id: "settings";
  supportPhone: string;
  website: string;
  shopdeckColumnMap: Record<string, string>;
  updatedAt: string;
}

export interface DispatchMetrics {
  totalOrders: number;
  pendingWhatsApp: number;
  whatsappSent: number;
  delivered: number;
  cancelled: number;
  cod: number;
  prepaid: number;
  todayImport: number;
  latestImportSession?: ImportSession;
}
