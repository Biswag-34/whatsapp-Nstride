import { z } from "zod";

export const newOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Customer name is required"),
  mobileNumber: z
    .string()
    .trim()
    .min(10, "Enter a valid mobile number")
    .max(18, "Enter a valid mobile number"),
  address: z.string().trim().min(6, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pinCode: z.string().trim().min(5, "PIN code is required").max(8, "PIN code is too long"),
  product: z.string().trim().min(2, "Product name is required"),
  category: z.string().trim().min(2, "Category is required"),
  size: z.string().trim().min(1, "Size is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  amount: z.coerce.number().min(1, "Amount is required"),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  paymentMode: z.enum(["COD", "Prepaid", "UPI", "Card"]),
  courier: z.string().trim().min(2, "Courier is required"),
  trackingId: z.string().trim().min(3, "Tracking ID is required"),
  trackingUrl: z.string().trim().url("Enter a valid tracking URL"),
  status: z.enum([
    "Pending",
    "New",
    "Confirmed",
    "WhatsApp Sent",
    "Dispatched",
    "Delivered",
    "Cancelled",
  ]),
  orderDate: z.string().min(1, "Order date is required"),
  dispatchDate: z.string().optional(),
  expectedDelivery: z.string().optional(),
});

export type NewOrderFormValues = z.input<typeof newOrderSchema>;
export type NewOrderInput = z.output<typeof newOrderSchema>;
