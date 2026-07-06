import type { CustomerCrmState, CustomerProfile } from "@/features/customers/types";
import type { Order } from "@/features/orders/types";

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  return digits.slice(-10) || digits || "unknown";
}

function mostFrequent(values: string[]) {
  const counts = values.reduce<Record<string, number>>((current, value) => {
    if (!value) {
      return current;
    }

    current[value] = (current[value] ?? 0) + 1;
    return current;
  }, {});

  return (
    Object.entries(counts).sort((first, second) => second[1] - first[1])[0]?.[0] ?? "Not set"
  );
}

function sortOrdersChronologically(orders: Order[]) {
  return [...orders].sort(
    (first, second) =>
      new Date(first.orderDate).getTime() - new Date(second.orderDate).getTime(),
  );
}

export function buildCustomerProfiles(
  orders: Order[],
  crmByCustomerId: Record<string, CustomerCrmState>,
) {
  const grouped = orders.reduce<Record<string, Order[]>>((current, order) => {
    const phone = normalizePhone(order.mobileNumber);

    current[phone] = [...(current[phone] ?? []), order];
    return current;
  }, {});

  return Object.entries(grouped)
    .map<CustomerProfile>(([phone, customerOrders]) => {
      const chronologicalOrders = sortOrdersChronologically(customerOrders);
      const latestOrder = chronologicalOrders[chronologicalOrders.length - 1];
      const firstOrder = chronologicalOrders[0];
      const customerId = `CUS-${phone}`;
      const totalRevenue = customerOrders.reduce((total, order) => total + order.total, 0);
      const codCount = customerOrders.filter((order) => order.paymentMode === "COD").length;
      const prepaidCount = customerOrders.length - codCount;
      const crmState = crmByCustomerId[customerId] ?? { notes: [], tags: [] };
      const autoTags = [
        customerOrders.length > 1 ? "Repeat Customer" : "First Order",
        totalRevenue >= 5000 ? "High Value" : "",
        customerOrders.some((order) => order.paymentMode === "COD") ? "Pending Payment" : "",
      ].filter(Boolean);
      const tags = Array.from(new Set([...crmState.tags, ...autoTags])) as CustomerProfile["tags"];

      return {
        id: customerId,
        customerId,
        customerName: latestOrder.customerName,
        phoneNumber: latestOrder.mobileNumber,
        email: "Not provided",
        address: latestOrder.address,
        city: latestOrder.city,
        state: latestOrder.state,
        pinCode: latestOrder.pinCode,
        customerSince: firstOrder.orderDate,
        orders: chronologicalOrders,
        totalOrders: customerOrders.length,
        totalRevenue,
        averageOrderValue: totalRevenue / customerOrders.length,
        firstPurchase: firstOrder.orderDate,
        lastPurchase: latestOrder.orderDate,
        lastOrderDate: latestOrder.orderDate,
        preferredProduct: mostFrequent(customerOrders.map((order) => order.product)),
        preferredSize: mostFrequent(customerOrders.map((order) => order.size)),
        preferredCategory: mostFrequent(customerOrders.map((order) => order.category)),
        whatsappStatus: customerOrders.some((order) =>
          ["WhatsApp Sent", "Dispatched", "Delivered"].includes(order.status),
        )
          ? "Sent"
          : "Pending",
        codPercentage: Math.round((codCount / customerOrders.length) * 100),
        prepaidPercentage: Math.round((prepaidCount / customerOrders.length) * 100),
        paymentModes: Array.from(new Set(customerOrders.map((order) => order.paymentMode))),
        tags,
        notes: crmState.notes,
      };
    })
    .sort((first, second) => second.totalRevenue - first.totalRevenue);
}

export function getCustomerWhatsappUrl(customer: CustomerProfile) {
  const phone = customer.phoneNumber.replace(/\D/g, "");
  const text = encodeURIComponent(
    `Hello ${customer.customerName}, thank you for choosing N-Stride. Comfort • Protection • Every Step Matters.`,
  );

  return `https://wa.me/${phone}?text=${text}`;
}
