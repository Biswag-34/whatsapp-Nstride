import {
  Copy,
  ExternalLink,
  FileImage,
  Phone,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PaymentPill, StatusPill } from "@/components/dispatch/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getOrderCommunicationTimeline } from "@/features/dispatch/services/communication-timeline-service";
import { generateCommunicationMessage } from "@/features/dispatch/services/message-generator-service";
import { getOrderVariant } from "@/features/dispatch/services/operations";
import { openWhatsApp } from "@/features/dispatch/services/whatsapp-service";
import type { DispatchOrder } from "@/features/dispatch/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useDispatchStore } from "@/stores/use-dispatch-store";

interface WhatsAppDispatchModalProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  order?: DispatchOrder;
}

function InfoBlock({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background/45 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value || "Not set"}</p>
    </div>
  );
}

function copyText(value: string) {
  return navigator.clipboard.writeText(value);
}

function generateOrderCard(order: DispatchOrder, message: string) {
  const win = window.open("", "_blank", "noopener,noreferrer");

  if (!win) {
    return;
  }

  win.document.write(`
    <html>
      <head>
        <title>N-Stride ${order.orderId}</title>
        <style>
          body { margin: 0; font-family: Inter, Arial, sans-serif; background: #f8fafc; color: #0f172a; }
          .card { width: 760px; margin: 32px auto; border: 1px solid #dbe5e2; border-radius: 24px; padding: 32px; background: white; box-shadow: 0 24px 60px rgba(15,23,42,.12); }
          .brand { color: #0e7c66; font-weight: 800; font-size: 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
          .box { border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; }
          .label { color: #64748b; font-size: 12px; text-transform: uppercase; }
          .value { font-size: 16px; font-weight: 700; margin-top: 6px; }
          pre { white-space: pre-wrap; background: #f1f5f9; padding: 18px; border-radius: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">N-Stride Dispatch</div>
          <h1>${order.orderId}</h1>
          <div class="grid">
            <div class="box"><div class="label">Customer</div><div class="value">${order.customerName}</div></div>
            <div class="box"><div class="label">Phone</div><div class="value">${order.phone}</div></div>
            <div class="box"><div class="label">Product</div><div class="value">${order.product}</div></div>
            <div class="box"><div class="label">Tracking</div><div class="value">${order.trackingId || "Missing"}</div></div>
          </div>
          <pre>${message}</pre>
        </div>
      </body>
    </html>
  `);
  win.document.close();
}

export function WhatsAppDispatchModal({ onOpenChange, open, order }: WhatsAppDispatchModalProps) {
  const templates = useDispatchStore((state) => state.templates);
  const dispatchHistory = useDispatchStore((state) => state.dispatchHistory);
  const messageHistory = useDispatchStore((state) => state.messageHistory);
  const markWhatsAppOpened = useDispatchStore((state) => state.markWhatsAppOpened);
  const markWhatsAppSent = useDispatchStore((state) => state.markWhatsAppSent);
  const recordGeneratedMessage = useDispatchStore((state) => state.recordGeneratedMessage);
  const [templateId, setTemplateId] = useState("");
  const [openNotice, setOpenNotice] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const recordedKey = useRef("");
  const selectedTemplate =
    templates.find((template) => template.id === templateId) ??
    templates.find((template) => template.isDefault) ??
    templates[0];
  const generated = useMemo(
    () => (order && selectedTemplate ? generateCommunicationMessage(order, selectedTemplate) : undefined),
    [order, selectedTemplate],
  );
  const previousMessages = useMemo(
    () =>
      order
        ? messageHistory
            .filter((message) => message.orderId === order.orderId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [messageHistory, order],
  );
  const timeline = useMemo(
    () => (order ? getOrderCommunicationTimeline(order, dispatchHistory, messageHistory) : []),
    [dispatchHistory, messageHistory, order],
  );

  useEffect(() => {
    if (!open || !order || !selectedTemplate) {
      return;
    }

    setOpenNotice("");
    setShowConfirmation(false);
    setTemplateId((current) => current || selectedTemplate.id);
  }, [open, order, selectedTemplate]);

  useEffect(() => {
    if (!open || !generated) {
      return;
    }

    const key = `${generated.orderId}:${generated.templateId}:${generated.body}`;

    if (recordedKey.current === key) {
      return;
    }

    recordedKey.current = key;
    void recordGeneratedMessage(generated);
  }, [generated, open, recordGeneratedMessage]);

  if (!order || !generated || !selectedTemplate) {
    return <Dialog open={open} onOpenChange={onOpenChange} />;
  }

  async function handleOpenWhatsApp() {
    if (!order || !generated) {
      return;
    }

    const result = openWhatsApp(order, generated.body);

    if (result.locked) {
      setOpenNotice("Please wait a moment before opening the next WhatsApp chat.");
      return;
    }

    if (result.blockedByPopup) {
      setOpenNotice("The browser blocked WhatsApp. Allow popups for this app and try again.");
      return;
    }

    await markWhatsAppOpened(order.id, "Dispatch Staff");
    setOpenNotice(
      result.reused
        ? "WhatsApp tab reused. Send manually in WhatsApp, then mark sent here when done."
        : "WhatsApp opened. Send manually in WhatsApp, then mark sent here when done.",
    );
  }

  async function confirmSent() {
    if (!order) {
      return;
    }

    await markWhatsAppSent([order.id], "Dispatch Staff");
    setShowConfirmation(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-7xl overflow-hidden p-0">
        <div className="border-b border-border p-5 pr-12">
          <DialogTitle className="text-xl font-semibold tracking-normal">WhatsApp Dispatch</DialogTitle>
          <DialogDescription>
            Generate, preview, send, and confirm the customer dispatch message.
          </DialogDescription>
        </div>

        <div className="grid max-h-[calc(92vh-9rem)] gap-0 overflow-hidden lg:grid-cols-[0.9fr_1.25fr_0.9fr]">
          <div className="space-y-4 overflow-auto border-r border-border p-5">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoBlock label="Name" value={order.customerName} />
                <InfoBlock label="Phone" value={order.phone} />
                <InfoBlock label="Address" value={order.address} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Product</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <InfoBlock label="Product" value={order.product} />
                <InfoBlock label="Variant" value={getOrderVariant(order)} />
                <InfoBlock label="Size" value={order.size} />
                <InfoBlock label="Quantity" value={order.quantity} />
                <InfoBlock label="Amount" value={formatCurrency(order.amount)} />
                <PaymentPill payment={order.paymentType} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoBlock label="Courier" value={order.courier} />
                <InfoBlock label="Tracking ID" value={order.trackingId} />
                <InfoBlock label="Tracking URL" value={order.trackingUrl} />
                <StatusPill status={order.status} />
              </CardContent>
            </Card>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden p-5">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Live WhatsApp Preview</p>
                <p className="text-xs text-muted-foreground">Exactly as the customer will receive it.</p>
              </div>
              <select
                className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={selectedTemplate.id}
                onChange={(event) => {
                  recordedKey.current = "";
                  setTemplateId(event.target.value);
                }}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-border bg-[#e8f5ef] p-4 dark:bg-[#0e211c]">
              <pre className="whitespace-pre-wrap rounded-2xl bg-white p-5 font-sans text-sm leading-6 text-slate-900 shadow-sm dark:bg-[#102d27] dark:text-emerald-50">
                {generated.body}
              </pre>
            </div>
            {previousMessages.length > 0 ? (
              <div className="mt-3 rounded-xl border border-border bg-background/45 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Communication History</p>
                <div className="mt-2 max-h-28 space-y-2 overflow-auto">
                  {previousMessages.slice(0, 5).map((message) => (
                    <button
                      key={message.id}
                      type="button"
                      className="block w-full rounded-lg bg-muted/50 p-2 text-left text-xs hover:bg-muted"
                      onClick={() => void copyText(message.body)}
                    >
                      {message.templateName} - {formatDateTime(message.createdAt)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 overflow-auto border-l border-border p-5">
            <p className="text-sm font-semibold">Quick Actions</p>
            <Button className="w-full justify-start" onClick={() => void handleOpenWhatsApp()}>
              <ExternalLink />
              Open WhatsApp
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => void copyText(generated.body)}>
              <Copy />
              Copy Message
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => void copyText(order.trackingId)}>
              <Copy />
              Copy Tracking ID
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => void copyText(order.trackingUrl)}>
              <Copy />
              Copy Tracking URL
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => void copyText(order.address)}>
              <Copy />
              Copy Address
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => generateOrderCard(order, generated.body)}>
              <FileImage />
              Generate Order Card
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => setShowConfirmation(true)}>
              <Send />
              Mark WhatsApp Sent
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => (window.location.href = `tel:${order.phone}`)}>
              <Phone />
              Call Customer
            </Button>

            {openNotice ? (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-100">
                {openNotice}
              </div>
            ) : null}

            {showConfirmation ? (
              <div className="rounded-xl border border-primary/25 bg-primary/10 p-4">
                <p className="text-sm font-semibold">Did you send the message?</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => void confirmSent()}>
                    YES
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowConfirmation(false)}>
                    NO
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-border bg-background/95 p-4">
          <p className="mb-3 text-sm font-semibold">Timeline</p>
          <div className="flex gap-3 overflow-auto pb-1">
            {timeline.map((item) => (
              <div key={item.id} className="min-w-64 rounded-lg border border-border bg-muted/35 p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
