import type { CommunicationMessage, DispatchHistoryEvent, DispatchOrder } from "@/features/dispatch/types";

export function getOrderCommunicationTimeline(
  order: DispatchOrder,
  history: DispatchHistoryEvent[],
  messages: CommunicationMessage[],
) {
  return [
    ...order.changeLog.map((entry) => ({
      createdAt: entry.createdAt,
      description: entry.description,
      id: entry.id,
      title: entry.title,
    })),
    ...history
      .filter((event) => event.orderId === order.orderId)
      .map((event) => ({
        createdAt: event.createdAt,
        description: event.description,
        id: event.id,
        title: event.title,
      })),
    ...messages
      .filter((message) => message.orderId === order.orderId)
      .map((message) => ({
        createdAt: message.createdAt,
        description: message.templateName,
        id: message.id,
        title: "Message Generated",
      })),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
