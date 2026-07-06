import { renderMessageTemplate } from "@/features/dispatch/services/template-engine";
import type { CommunicationMessage, DispatchOrder, MessageTemplate } from "@/features/dispatch/types";

export function generateCommunicationMessage(
  order: DispatchOrder,
  template: MessageTemplate,
  createdBy = "Dispatch Staff",
): CommunicationMessage {
  return {
    body: renderMessageTemplate(order, template.body),
    createdAt: new Date().toISOString(),
    createdBy,
    id: crypto.randomUUID(),
    orderId: order.orderId,
    templateId: template.id,
    templateName: template.name,
    templateType: template.type,
  };
}
