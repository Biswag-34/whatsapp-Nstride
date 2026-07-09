export type DispatchOrderStatus =
  | "pending_dispatch"
  | "whatsapp_ready"
  | "whatsapp_sent"
  | "delivered"
  | "cancelled"
  | "rto";

export type PaymentType = "COD" | "Prepaid" | "Unknown";

export type MessageTemplateType =
  | "default_dispatch"
  | "delivered"
  | "tracking_updated"
  | "delay_notification"
  | "replacement"
  | "exchange"
  | "return";

export interface OrderChangeLogEntry {
  id: string;
  createdAt: string;
  description: string;
  field?: keyof ShopdeckOrderFields;
  importSessionId?: string;
  title: string;
}

export interface ShopdeckOrderFields {
  address: string;
  amount: number;
  city: string;
  courier: string;
  customerName: string;
  orderDate: string;
  paymentType: PaymentType;
  phone: string;
  pinCode: string;
  product: string;
  quantity: number;
  size: string;
  state: string;
  trackingId: string;
  trackingUrl: string;
}

export interface DispatchOrder {
  id: string;
  orderId: string;
  shopdeckOrderId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
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
  fieldFingerprint: string;
  sourceHeaders: string[];
  sourceRow: Record<string, string>;
  sourceRowFingerprint: string;
  createdAt: string;
  updatedAt: string;
  changeLog: OrderChangeLogEntry[];
  whatsappOpenedAt?: string;
  whatsappOpenedBy?: string;
  whatsappSentAt?: string;
}

export interface ImportSession {
  id: string;
  fileName: string;
  importedAt: string;
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  durationMs: number;
  duplicateOrderIds: string[];
  validationErrors: ImportValidationIssue[];
  sourceHeaders: string[];
}

export interface ImportValidationIssue {
  field: string;
  message: string;
  orderId?: string;
  rowNumber: number;
  severity: "error" | "warning";
}

export interface DispatchHistoryEvent {
  id: string;
  createdAt: string;
  description: string;
  importSessionId?: string;
  orderId?: string;
  title: string;
  type: "import" | "update" | "whatsapp" | "system" | "validation";
}

export interface MessageTemplate {
  id: string;
  name: string;
  body: string;
  isDefault: boolean;
  type: MessageTemplateType;
  updatedAt: string;
}

export interface CommunicationMessage {
  id: string;
  body: string;
  createdAt: string;
  createdBy: string;
  orderId: string;
  templateId: string;
  templateName: string;
  templateType: MessageTemplateType;
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
