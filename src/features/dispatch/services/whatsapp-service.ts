import type { DispatchOrder } from "@/features/dispatch/types";

let whatsappWindow: Window | null = null;
let lastOpenAt = 0;

const whatsappWindowName = "whatsapp_order_sender";
const openLockMs = 2500;

export interface WhatsAppOpenResult {
  blockedByPopup?: boolean;
  locked?: boolean;
  opened: boolean;
  phone: string;
  reused: boolean;
  webUrl: string;
}

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }

  return digits;
}

export function buildWhatsAppLinks(order: DispatchOrder, message: string) {
  const phone = normalizeWhatsAppPhone(order.phone);
  const encoded = encodeURIComponent(message);

  return {
    phone,
    webUrl: `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`,
  };
}

export function openWhatsApp(order: DispatchOrder, message: string): WhatsAppOpenResult {
  const links = buildWhatsAppLinks(order, message);
  const now = Date.now();

  if (now - lastOpenAt < openLockMs) {
    return { ...links, locked: true, opened: false, reused: Boolean(whatsappWindow && !whatsappWindow.closed) };
  }

  lastOpenAt = now;

  if (whatsappWindow && !whatsappWindow.closed) {
    whatsappWindow.location.href = links.webUrl;
    whatsappWindow.focus();
    return { ...links, opened: true, reused: true };
  }

  whatsappWindow = window.open(links.webUrl, whatsappWindowName);
  whatsappWindow?.focus();

  return { ...links, blockedByPopup: !whatsappWindow, opened: Boolean(whatsappWindow), reused: false };
}
