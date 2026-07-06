import { MapPin, PackageCheck, Phone, Truck } from "lucide-react";
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

interface OrderCardAssetProps {
  order: Order;
  qrTarget: QrTarget;
}

export const OrderCardAsset = forwardRef<HTMLDivElement, OrderCardAssetProps>(
  ({ order, qrTarget }, ref) => {
    const qrValue = qrTarget === "tracking" ? order.trackingUrl || order.trackingId : "https://nstride.shop";

    return (
      <div
        ref={ref}
        className="w-full max-w-[760px] overflow-hidden rounded-[28px] border border-emerald-900/10 bg-[#f8fafc] p-5 text-slate-950 shadow-2xl shadow-slate-950/10"
      >
        <div className="rounded-[24px] bg-white/88 p-6 shadow-inner ring-1 ring-slate-950/5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <BrandLogo />
            <div className="rounded-2xl bg-[#0E7C66] px-4 py-3 text-right text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">Order Card</p>
              <p className="mt-1 text-lg font-semibold">{order.orderId}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_180px]">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-500">Customer</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">
                  {order.customerName}
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Product", order.product],
                  ["Size", order.size],
                  ["Quantity", String(order.quantity)],
                  ["Amount", formatCurrency(order.total)],
                  ["Payment Mode", order.paymentMode],
                  ["Dispatch Date", formatDate(order.dispatchDate)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-950/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-900/10">
              <QrCodeBox value={qrValue} label={qrTarget === "tracking" ? "Track Order" : "Visit Website"} />
              <p className="text-center text-xs leading-5 text-emerald-900">
                Scan for {qrTarget === "tracking" ? "tracking updates" : "N-Stride care"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#0F172A] p-5 text-white">
              <div className="flex items-center gap-2 text-emerald-200">
                <Truck className="size-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Shipping</p>
              </div>
              <p className="mt-3 text-sm">{order.courier}</p>
              <p className="mt-1 text-lg font-semibold">{order.trackingId}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-950/5">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="size-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Delivery Address</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{getDeliveryAddress(order)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="size-4 text-primary" />
              Support: +91 98765 43210
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <PackageCheck className="size-4 text-primary" />
              nstride.shop
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-[#0E7C66]">
            Comfort • Protection • Every Step Matters
          </p>
        </div>
      </div>
    );
  },
);

OrderCardAsset.displayName = "OrderCardAsset";
