import { create } from "zustand";
import { persist } from "zustand/middleware";

import { mockOrders } from "@/features/orders/data/mock-orders";
import type { NewOrderInput } from "@/features/orders/schemas/order-schema";
import type { Order, OrderStatus } from "@/features/orders/types";

interface OrdersState {
  orders: Order[];
  selectedOrderId: string | null;
  addOrder: (input: NewOrderInput) => void;
  addImportedOrders: (orders: Order[]) => void;
  deleteOrder: (id: string) => void;
  selectOrder: (id: string | null) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

function createOrder(input: NewOrderInput, orderCount: number): Order {
  const amount = Number(input.amount);
  const discount = Number(input.discount ?? 0);
  const tax = Number(input.tax ?? 0);
  const sequence = 10494 + orderCount;

  return {
    id: crypto.randomUUID(),
    orderId: `NS-${sequence}`,
    customerName: input.customerName,
    mobileNumber: input.mobileNumber,
    address: input.address,
    city: input.city,
    state: input.state,
    pinCode: input.pinCode,
    product: input.product,
    category: input.category,
    size: input.size,
    quantity: Number(input.quantity),
    amount,
    discount,
    tax,
    total: amount - discount + tax,
    paymentMode: input.paymentMode,
    courier: input.courier,
    trackingId: input.trackingId,
    trackingUrl: input.trackingUrl,
    status: input.status,
    orderDate: input.orderDate,
    dispatchDate: input.dispatchDate ?? "",
    expectedDelivery: input.expectedDelivery ?? "",
  };
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: mockOrders,
      selectedOrderId: null,
      addOrder: (input) =>
        set((state) => ({
          orders: [createOrder(input, state.orders.length), ...state.orders],
        })),
      addImportedOrders: (orders) =>
        set((state) => ({
          orders: [...orders, ...state.orders],
        })),
      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
          selectedOrderId: state.selectedOrderId === id ? null : state.selectedOrderId,
        })),
      selectOrder: (id) => set({ selectedOrderId: id }),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  status,
                  dispatchDate:
                    status === "Dispatched" && !order.dispatchDate
                      ? new Date().toISOString().slice(0, 10)
                      : order.dispatchDate,
                }
              : order,
          ),
        })),
    }),
    {
      name: "n-stride-orders",
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
);
