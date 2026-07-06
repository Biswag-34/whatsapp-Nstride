import { forwardRef } from "react";

import { BarcodeBox } from "@/features/brand-studio/components/barcode-box";
import { BrandLogo } from "@/features/brand-studio/components/brand-logo";
import { QrCodeBox } from "@/features/brand-studio/components/qr-code-box";
import type { Order } from "@/features/orders/types";
import { getDeliveryAddress } from "@/features/orders/utils/order-formatters";

interface ShippingSlipAssetProps {
  order: Order;
}

export const ShippingSlipAsset = forwardRef<HTMLDivElement, ShippingSlipAssetProps>(
  ({ order }, ref) => (
    <div ref={ref} className="w-[384px] bg-white p-5 text-slate-950 shadow-xl">
      <div className="border-2 border-dashed border-slate-950 p-4">
        <div className="flex items-start justify-between gap-3 border-b-2 border-slate-950 pb-3">
          <BrandLogo compact />
          <div className="text-right">
            <p className="text-xs font-bold uppercase">Shipping Slip</p>
            <p className="text-sm font-bold">{order.orderId}</p>
          </div>
        </div>

        <section className="border-b-2 border-slate-950 py-3">
          <p className="text-xs font-bold uppercase">Customer</p>
          <p className="mt-1 text-lg font-black">{order.customerName}</p>
          <p className="mt-1 text-sm font-semibold">{order.mobileNumber}</p>
          <p className="mt-2 text-sm leading-5">{getDeliveryAddress(order)}</p>
        </section>

        <section className="grid grid-cols-2 gap-3 border-b-2 border-slate-950 py-3">
          <div>
            <p className="text-xs font-bold uppercase">Courier</p>
            <p className="text-sm font-black">{order.courier}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase">Tracking</p>
            <p className="text-sm font-black">{order.trackingId}</p>
          </div>
        </section>

        <div className="py-3">
          <BarcodeBox value={order.trackingId || order.orderId} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-slate-950 pt-3">
          <QrCodeBox value={order.trackingUrl || order.trackingId} size={104} label="Track" />
          <div className="text-right text-xs leading-5">
            <p className="font-bold uppercase">Product</p>
            <p>{order.product}</p>
            <p>Size: {order.size}</p>
            <p>Qty: {order.quantity}</p>
          </div>
        </div>
      </div>
    </div>
  ),
);

ShippingSlipAsset.displayName = "ShippingSlipAsset";
