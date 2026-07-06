export type OrderStatus =
  | "Pending"
  | "New"
  | "Confirmed"
  | "WhatsApp Sent"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type PaymentMode = "COD" | "Prepaid" | "UPI" | "Card";

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  product: string;
  category: string;
  size: string;
  quantity: number;
  amount: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: PaymentMode;
  courier: string;
  trackingId: string;
  trackingUrl: string;
  status: OrderStatus;
  orderDate: string;
  dispatchDate: string;
  expectedDelivery: string;
}
