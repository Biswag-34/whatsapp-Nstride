import type { Order, PaymentMode } from "@/features/orders/types";

export type CustomerTag =
  | "VIP"
  | "Repeat Customer"
  | "First Order"
  | "High Value"
  | "Pending Payment"
  | "Medical Professional"
  | "Clinic"
  | "Hospital"
  | "Retailer"
  | "Distributor";

export interface CustomerNote {
  id: string;
  body: string;
  createdAt: string;
}

export interface CustomerCrmState {
  tags: CustomerTag[];
  notes: CustomerNote[];
}

export interface CustomerProfile {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  customerSince: string;
  customerId: string;
  orders: Order[];
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  lastOrderDate: string;
  firstPurchase: string;
  lastPurchase: string;
  preferredProduct: string;
  preferredSize: string;
  preferredCategory: string;
  whatsappStatus: "Sent" | "Pending";
  codPercentage: number;
  prepaidPercentage: number;
  paymentModes: PaymentMode[];
  tags: CustomerTag[];
  notes: CustomerNote[];
}

export interface CustomerFilters {
  vipOnly: boolean;
  repeatOnly: boolean;
  codOnly: boolean;
  prepaidOnly: boolean;
  city: string;
  state: string;
  minRevenue: string;
  minOrders: string;
}
