import type { DispatchOrder } from "@/features/dispatch/types";

export function buildWhatsAppLinks(order: DispatchOrder, message: string) {
  const phone = order.phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);

  return {
    desktopUrl: `whatsapp://send?phone=${phone}&text=${encoded}`,
    webUrl: `https://wa.me/${phone}?text=${encoded}`,
  };
}

export function openWhatsApp(order: DispatchOrder, message: string) {
  const links = buildWhatsAppLinks(order, message);
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = links.desktopUrl;
  document.body.appendChild(iframe);

  window.setTimeout(() => {
    iframe.remove();
    window.open(links.webUrl, "_blank", "noopener,noreferrer");
  }, 900);

  return links;
}
