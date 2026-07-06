import {
  Copy,
  Download,
  FileImage,
  FileText,
  Printer,
  QrCode,
  ReceiptText,
  Share2,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OrderCardAsset } from "@/features/brand-studio/components/order-card-asset";
import { PdfAsset } from "@/features/brand-studio/components/pdf-asset";
import { QrCodeBox } from "@/features/brand-studio/components/qr-code-box";
import { ShippingSlipAsset } from "@/features/brand-studio/components/shipping-slip-asset";
import type { BrandAssetType, QrTarget } from "@/features/brand-studio/types";
import {
  copyElementAsImage,
  downloadElementJpg,
  downloadElementPdf,
  downloadElementPng,
  printElement,
  shareElement,
} from "@/features/brand-studio/utils/asset-export";
import type { Order } from "@/features/orders/types";
import { formatCurrency } from "@/features/orders/utils/order-formatters";
import { cn } from "@/lib/utils";
import { useOrdersStore } from "@/stores/use-orders-store";

const assetOptions: Array<{
  label: string;
  value: BrandAssetType;
  icon: typeof FileImage;
  description: string;
}> = [
  {
    label: "Order Card",
    value: "order-card",
    icon: FileImage,
    description: "Premium branded customer card",
  },
  {
    label: "PDF",
    value: "pdf",
    icon: FileText,
    description: "A4 dispatch document",
  },
  {
    label: "Shipping Slip",
    value: "shipping-slip",
    icon: Truck,
    description: "Thermal printer friendly slip",
  },
  {
    label: "Invoice Cover",
    value: "invoice-cover",
    icon: ReceiptText,
    description: "Professional invoice front page",
  },
];

function selectedAssetFileName(order: Order, assetType: BrandAssetType, extension: string) {
  return `${order.orderId}-${assetType}.${extension}`;
}

export function BrandStudioPage() {
  const orders = useOrdersStore((state) => state.orders);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");
  const [assetType, setAssetType] = useState<BrandAssetType>("order-card");
  const [qrTarget, setQrTarget] = useState<QrTarget>("tracking");
  const [message, setMessage] = useState("");
  const assetRef = useRef<HTMLDivElement>(null);
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0],
    [orders, selectedOrderId],
  );

  async function withAsset(action: (element: HTMLElement) => Promise<void> | void) {
    if (!assetRef.current || !selectedOrder) {
      return;
    }

    setMessage("");

    try {
      await action(assetRef.current);
    } catch {
      setMessage("This browser could not complete the asset action.");
    }
  }

  if (!selectedOrder) {
    return (
      <div className="glass-panel rounded-2xl border border-border p-8">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">Brand Studio</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Add an order first to generate branded communication assets.
        </p>
      </div>
    );
  }

  const qrValue =
    qrTarget === "tracking"
      ? selectedOrder.trackingUrl || selectedOrder.trackingId
      : "https://nstride.shop";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      <section className="glass-panel rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="success">Brand Studio</Badge>
              <span className="text-sm text-muted-foreground">Local asset generation</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              Brand Studio
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Generate premium branded order cards, PDFs, QR codes, shipping slips, and
              invoice covers from live CRM orders.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                withAsset((element) =>
                  downloadElementPng(
                    element,
                    selectedAssetFileName(selectedOrder, assetType, "png"),
                  ),
                )
              }
            >
              <Download />
              Download PNG
            </Button>
            <Button
              type="button"
              onClick={() =>
                withAsset((element) =>
                  downloadElementPdf(
                    element,
                    selectedAssetFileName(selectedOrder, assetType, "pdf"),
                  ),
                )
              }
            >
              <FileText />
              Generate PDF
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Asset Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Order</span>
                <select
                  value={selectedOrder.id}
                  onChange={(event) => setSelectedOrderId(event.target.value)}
                  className="h-10 rounded-lg border border-input bg-white/70 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/[0.04]"
                >
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.orderId} - {order.customerName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Asset Type</span>
                {assetOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAssetType(option.value)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border bg-background/55 p-3 text-left transition-colors hover:bg-muted/70 dark:bg-white/[0.03]",
                        assetType === option.value &&
                          "border-primary/30 bg-primary/10 text-primary dark:text-emerald-100",
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium text-foreground">QR Code Target</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["tracking", "website"] as QrTarget[]).map((target) => (
                    <Button
                      key={target}
                      type="button"
                      variant={qrTarget === target ? "default" : "outline"}
                      onClick={() => setQrTarget(target)}
                    >
                      <QrCode />
                      {target === "tracking" ? "Tracking" : "Website"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/55 p-4 dark:bg-white/[0.03]">
                <p className="text-sm font-semibold text-foreground">Selected Order</p>
                <p className="mt-2 text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedOrder.product}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatCurrency(selectedOrder.total)}
                </p>
              </div>

              <Input value={qrValue} readOnly className="bg-white/70 dark:bg-white/[0.04]" />
              <div className="flex justify-center">
                <QrCodeBox value={qrValue} label="Standalone QR" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  withAsset((element) =>
                    downloadElementJpg(
                      element,
                      selectedAssetFileName(selectedOrder, assetType, "jpg"),
                    ),
                  )
                }
              >
                <Download />
                Download JPG
              </Button>
              <Button type="button" variant="outline" onClick={() => withAsset(printElement)}>
                <Printer />
                Print
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => withAsset(copyElementAsImage)}
              >
                <Copy />
                Copy
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  withAsset(async (element) => {
                    const shared = await shareElement(
                      element,
                      selectedAssetFileName(selectedOrder, assetType, "png"),
                    );

                    if (!shared) {
                      setMessage("Sharing is not available in this browser.");
                    }
                  })
                }
              >
                <Share2 />
                Share
              </Button>
              {message ? (
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{message}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="glass-panel min-w-0 overflow-auto rounded-2xl border border-border p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-foreground">
                Live Preview
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dark-mode compatible workspace, print-ready exported asset.
              </p>
            </div>
            <Badge variant="slate">{assetOptions.find((item) => item.value === assetType)?.label}</Badge>
          </div>

          <div className="flex min-h-[640px] items-start justify-center overflow-auto rounded-xl bg-muted/55 p-4 dark:bg-black/20">
            {assetType === "order-card" ? (
              <OrderCardAsset ref={assetRef} order={selectedOrder} qrTarget={qrTarget} />
            ) : null}
            {assetType === "pdf" ? (
              <PdfAsset ref={assetRef} order={selectedOrder} qrTarget={qrTarget} variant="pdf" />
            ) : null}
            {assetType === "invoice-cover" ? (
              <PdfAsset
                ref={assetRef}
                order={selectedOrder}
                qrTarget={qrTarget}
                variant="invoice-cover"
              />
            ) : null}
            {assetType === "shipping-slip" ? (
              <ShippingSlipAsset ref={assetRef} order={selectedOrder} />
            ) : null}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
