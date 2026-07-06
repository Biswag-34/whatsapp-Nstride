import { FileText, MapPin, PackageCheck, Truck } from "lucide-react";
import { forwardRef } from "react";

import { BrandLogo } from "@/features/brand-studio/components/brand-logo";
import { QrCodeBox } from "@/features/brand-studio/components/qr-code-box";
import type { QrTarget } from "@/features/brand-studio/types";
import type { Order } from "@/features/orders/types";
import {
  formatCurrency,
  formatDate,
  getDeliveryAddress,
} from "@/features/orders/utils/order-formatters";

interface PdfAssetProps {
  order: Order;
  qrTarget: QrTarget;
  variant: "pdf" | "invoice-cover";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}

export const PdfAsset = forwardRef<HTMLDivElement, PdfAssetProps>(
  ({ order, qrTarget, variant }, ref) => {
    const qrValue = qrTarget === "tracking" ? order.trackingUrl || order.trackingId : "https://nstride.shop";
    const title = variant === "invoice-cover" ? "Invoice Cover" : "Order Dispatch PDF";

    return (
      <div ref={ref} className="w-[794px] bg-white p-10 text-slate-950 shadow-2xl">
        <header className="flex items-start justify-between border-b-4 border-[#0E7C66] pb-8">
          <BrandLogo />
          <div className="text-right">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0E7C66]">
              {title}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">{order.orderId}</h2>
            <p className="mt-1 text-sm text-slate-500">{formatDate(order.orderDate)}</p>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-[1fr_180px] gap-8">
          <div>
            <p className="text-sm font-medium text-slate-500">Prepared for</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal">{order.customerName}</h1>
            <div className="mt-6 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-[#0E7C66]">
                <MapPin className="size-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Delivery Address</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{getDeliveryAddress(order)}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-5 text-center ring-1 ring-emerald-900/10">
            <QrCodeBox value={qrValue} label={qrTarget === "tracking" ? "Track" : "Website"} />
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="mb-3 flex items-center gap-2 text-[#0E7C66]">
              <PackageCheck className="size-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Order Details</h3>
            </div>
            <Row label="Product" value={order.product} />
            <Row label="Size" value={order.size} />
            <Row label="Quantity" value={String(order.quantity)} />
            <Row label="Amount" value={formatCurrency(order.total)} />
            <Row label="Payment" value={order.paymentMode} />
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="mb-3 flex items-center gap-2 text-[#0E7C66]">
              <Truck className="size-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Shipping</h3>
            </div>
            <Row label="Courier" value={order.courier} />
            <Row label="Tracking ID" value={order.trackingId} />
            <Row label="Dispatch Date" value={formatDate(order.dispatchDate)} />
            <Row label="Website" value="nstride.shop" />
            <Row label="Support" value="+91 98765 43210" />
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-[#0F172A] p-7 text-white">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-[#15B392]" />
            <h3 className="text-lg font-semibold">Care Note</h3>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Thank you for choosing N-Stride. This order has been prepared with care for
            comfort, protection, and everyday mobility support.
          </p>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm font-semibold text-[#0E7C66]">
            Comfort • Protection • Every Step Matters
          </p>
          <p className="mt-2 text-xs text-slate-500">https://nstride.shop</p>
        </footer>
      </div>
    );
  },
);

PdfAsset.displayName = "PdfAsset";
