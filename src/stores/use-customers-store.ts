import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CustomerCrmState, CustomerTag } from "@/features/customers/types";

interface CustomersState {
  customers: Record<string, CustomerCrmState>;
  addNote: (customerId: string, body: string) => void;
  toggleTag: (customerId: string, tag: CustomerTag) => void;
}

function getCustomerState(customers: Record<string, CustomerCrmState>, customerId: string) {
  return customers[customerId] ?? { notes: [], tags: [] };
}

export const useCustomersStore = create<CustomersState>()(
  persist(
    (set) => ({
      customers: {},
      addNote: (customerId, body) =>
        set((state) => {
          const customer = getCustomerState(state.customers, customerId);

          return {
            customers: {
              ...state.customers,
              [customerId]: {
                ...customer,
                notes: [
                  {
                    id: crypto.randomUUID(),
                    body,
                    createdAt: new Date().toISOString(),
                  },
                  ...customer.notes,
                ],
              },
            },
          };
        }),
      toggleTag: (customerId, tag) =>
        set((state) => {
          const customer = getCustomerState(state.customers, customerId);
          const hasTag = customer.tags.includes(tag);

          return {
            customers: {
              ...state.customers,
              [customerId]: {
                ...customer,
                tags: hasTag
                  ? customer.tags.filter((currentTag) => currentTag !== tag)
                  : [...customer.tags, tag],
              },
            },
          };
        }),
    }),
    {
      name: "n-stride-customers",
    },
  ),
);
