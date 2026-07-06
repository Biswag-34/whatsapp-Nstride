import { motion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  BellDot,
  CheckCircle2,
  History,
  MessageCircle,
  PackageCheck,
  PackageOpen,
  PackageX,
  RefreshCw,
  Truck,
  UploadCloud,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";

import { MetricCard } from "@/components/dispatch/metric-card";
import { OrderDrawer } from "@/components/dispatch/order-drawer";
import { PaymentPill, StatusPill } from "@/components/dispatch/status-pill";
import { WhatsAppDispatchModal } from "@/components/dispatch/whatsapp-dispatch-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildOperationsSummary,
  getDuplicatePhoneOrders,
  getPendingQueueOrders,
  getWhatsAppStatus,
  isOlderThanHours,
  isPendingWhatsApp,
  isValidPhone,
} from "@/features/dispatch/services/operations";
import type { DispatchOrder } from "@/features/dispatch/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useDispatchStore } from "@/stores/use-dispatch-store";

function AttentionItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/45 p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export function DashboardPage() {
  const orders = useDispatchStore((state) => state.orders);
  const importSessions = useDispatchStore((state) => state.importSessions);
  const dispatchHistory = useDispatchStore((state) => state.dispatchHistory);
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder>();
  const [dispatchOrder, setDispatchOrder] = useState<DispatchOrder>();
  const summary = useMemo(() => buildOperationsSummary(orders, importSessions), [orders, importSessions]);
  const queueOrders = useMemo(() => getPendingQueueOrders(orders).slice(0, 20), [orders]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Operations Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">
          Dispatch command workspace
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={PackageCheck} label="Total Orders" value={summary.totalOrders} />
        <MetricCard icon={UploadCloud} label="Today's Imported Orders" value={summary.todayImportedOrders} />
        <MetricCard icon={BellDot} label="Pending WhatsApp" tone="amber" value={summary.pendingWhatsApp} />
        <MetricCard icon={MessageCircle} label="WhatsApp Sent" tone="emerald" value={summary.whatsappSent} />
        <MetricCard icon={PackageOpen} label="Pending Dispatch" tone="amber" value={summary.pendingDispatch} />
        <MetricCard icon={Truck} label="Dispatched" value={summary.dispatched} />
        <MetricCard icon={CheckCircle2} label="Delivered" tone="emerald" value={summary.delivered} />
        <MetricCard icon={PackageX} label="Cancelled" tone="slate" value={summary.cancelled} />
        <MetricCard icon={RefreshCw} label="RTO" tone="slate" value={summary.rto} />
        <MetricCard icon={Banknote} label="COD Orders" tone="amber" value={summary.codOrders} />
        <MetricCard icon={WalletCards} label="Prepaid Orders" tone="emerald" value={summary.prepaidOrders} />
        <MetricCard icon={AlertTriangle} label="Orders Without Tracking" tone="amber" value={summary.ordersWithoutTracking} />
        <MetricCard icon={History} label="Orders Updated Today" value={summary.ordersUpdatedToday} />
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2">File Name</th>
                  <th className="px-3 py-2">Import Time</th>
                  <th className="px-3 py-2">Imported</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2">Skipped</th>
                  <th className="px-3 py-2">Errors</th>
                </tr>
              </thead>
              <tbody>
                {importSessions.slice(0, 8).map((session) => (
                  <tr key={session.id} className="border-b border-border/70">
                    <td className="px-3 py-3 font-medium">{session.fileName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDateTime(session.importedAt)}</td>
                    <td className="px-3 py-3">{session.imported}</td>
                    <td className="px-3 py-3">{session.updated}</td>
                    <td className="px-3 py-3">{session.skipped}</td>
                    <td className="px-3 py-3">{session.errors}</td>
                  </tr>
                ))}
                {importSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                      Import history will appear after a Shopdeck CSV is imported.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Pending Dispatch Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2">Order ID</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Courier</th>
                  <th className="px-3 py-2">Tracking</th>
                  <th className="px-3 py-2">WhatsApp Status</th>
                  <th className="px-3 py-2">Dispatch Status</th>
                  <th className="px-3 py-2">Shopdeck Order Date</th>
                  <th className="px-3 py-2">Imported At</th>
                  <th className="px-3 py-2">Buttons</th>
                </tr>
              </thead>
              <tbody>
                {queueOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/70">
                    <td className="px-3 py-3 font-medium">{order.orderId}</td>
                    <td className="px-3 py-3">{order.customerName}</td>
                    <td className="px-3 py-3">{order.phone}</td>
                    <td className="max-w-52 truncate px-3 py-3">{order.product}</td>
                    <td className="px-3 py-3">{formatCurrency(order.amount)}</td>
                    <td className="px-3 py-3"><PaymentPill payment={order.paymentType} /></td>
                    <td className="px-3 py-3">{order.courier || "Not set"}</td>
                    <td className="px-3 py-3">{order.trackingId || "Missing"}</td>
                    <td className="px-3 py-3">{getWhatsAppStatus(order)}</td>
                    <td className="px-3 py-3"><StatusPill status={order.status} /></td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDateTime(order.orderDate)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDateTime(order.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>Open</Button>
                        <Button size="sm" onClick={() => setDispatchOrder(order)}>Dispatch</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {queueOrders.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-3 py-10 text-center text-muted-foreground">
                      No pending dispatch orders are currently in IndexedDB.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Attention Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AttentionItem label="Orders without Tracking ID" value={summary.ordersWithoutTracking} />
            <AttentionItem label="Orders with Invalid Phone" value={orders.filter((order) => !isValidPhone(order.phone)).length} />
            <AttentionItem label="Duplicate Phone Numbers" value={getDuplicatePhoneOrders(orders).length} />
            <AttentionItem label="Cancelled Orders" value={summary.cancelled} />
            <AttentionItem
              label="Pending WhatsApp older than 24 hours"
              value={orders.filter((order) => isPendingWhatsApp(order) && isOlderThanHours(order.updatedAt, 24)).length}
            />
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dispatchHistory.slice(0, 10).map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border bg-background/45 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(activity.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
            {dispatchHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Activity will appear after imports and dispatch actions.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <OrderDrawer
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(undefined)}
        onSendWhatsApp={setDispatchOrder}
      />
      <WhatsAppDispatchModal
        open={Boolean(dispatchOrder)}
        order={dispatchOrder}
        onOpenChange={(open) => !open && setDispatchOrder(undefined)}
      />
    </motion.div>
  );
}
