import {
  ArrowLeft,
  Copy,
  FileText,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Plus,
  StickyNote,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerTag } from "@/features/customers/types";
import {
  buildCustomerProfiles,
  getCustomerWhatsappUrl,
} from "@/features/customers/utils/customer-analytics";
import { StatusBadge } from "@/features/orders/components/status-badge";
import {
  downloadCsv,
  formatCurrency,
  formatDate,
  getDeliveryAddress,
} from "@/features/orders/utils/order-formatters";
import { cn } from "@/lib/utils";
import { useCustomersStore } from "@/stores/use-customers-store";
import { useOrdersStore } from "@/stores/use-orders-store";

const customerTags: CustomerTag[] = [
  "VIP",
  "Repeat Customer",
  "First Order",
  "High Value",
  "Pending Payment",
  "Medical Professional",
  "Clinic",
  "Hospital",
  "Retailer",
  "Distributor",
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="glass-panel p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-normal text-foreground">{value}</p>
    </Card>
  );
}

export function CustomerProfilePage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const orders = useOrdersStore((state) => state.orders);
  const customerCrm = useCustomersStore((state) => state.customers);
  const addNote = useCustomersStore((state) => state.addNote);
  const toggleTag = useCustomersStore((state) => state.toggleTag);
  const customers = useMemo(
    () => buildCustomerProfiles(orders, customerCrm),
    [customerCrm, orders],
  );
  const customer = customers.find((item) => item.id === customerId);

  if (!customer) {
    return (
      <div className="glass-panel rounded-2xl border border-border p-8">
        <h1 className="text-2xl font-semibold text-foreground">Customer not found</h1>
        <Button asChild className="mt-4">
          <Link to="/customers">Back to Customers</Link>
        </Button>
      </div>
    );
  }

  const currentCustomer = customer;
  const latestOrder = currentCustomer.orders[currentCustomer.orders.length - 1];

  function handleAddNote() {
    const trimmed = note.trim();

    if (!trimmed) {
      return;
    }

    addNote(currentCustomer.id, trimmed);
    setNote("");
  }

  function generateReport() {
    downloadCsv(`${currentCustomer.customerId}-report.csv`, [
      ["Metric", "Value"],
      ["Customer Name", currentCustomer.customerName],
      ["Phone", currentCustomer.phoneNumber],
      ["Total Orders", String(currentCustomer.totalOrders)],
      ["Total Revenue", String(currentCustomer.totalRevenue)],
      ["Preferred Product", currentCustomer.preferredProduct],
      ["Preferred Size", currentCustomer.preferredSize],
      ["Preferred Category", currentCustomer.preferredCategory],
    ]);
  }

  function copyText(value: string) {
    void navigator.clipboard.writeText(value);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      <section className="glass-panel rounded-2xl border border-border p-5 sm:p-6">
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/customers")}>
          <ArrowLeft />
          Customers
        </Button>
        <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              {currentCustomer.customerName}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="size-4" />
                {currentCustomer.phoneNumber}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {currentCustomer.city || "City not set"}, {currentCustomer.state || "State not set"}
              </span>
              <span>{currentCustomer.customerId}</span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {currentCustomer.address} {currentCustomer.pinCode ? `- ${currentCustomer.pinCode}` : ""}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Email: {currentCustomer.email}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer Since: {formatDate(currentCustomer.customerSince)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild type="button" variant="outline">
              <a href={getCustomerWhatsappUrl(currentCustomer)} target="_blank" rel="noreferrer">
                <MessageCircle />
                Open WhatsApp
              </a>
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/orders")}>
              <Plus />
              Create New Order
            </Button>
            <Button type="button" onClick={generateReport}>
              <FileText />
              Generate Customer Report
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={String(currentCustomer.totalOrders)} />
        <StatCard label="Total Revenue" value={formatCurrency(currentCustomer.totalRevenue)} />
        <StatCard label="Average Order Value" value={formatCurrency(currentCustomer.averageOrderValue)} />
        <StatCard label="Last Purchase" value={formatDate(currentCustomer.lastPurchase)} />
        <StatCard label="First Purchase" value={formatDate(currentCustomer.firstPurchase)} />
        <StatCard label="COD %" value={`${currentCustomer.codPercentage}%`} />
        <StatCard label="Prepaid %" value={`${currentCustomer.prepaidPercentage}%`} />
        <StatCard label="WhatsApp Status" value={currentCustomer.whatsappStatus} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Purchase Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...currentCustomer.orders].reverse().map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-background/55 p-4 dark:bg-white/[0.03]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.orderId}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{order.product}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <span>Amount: {formatCurrency(order.total)}</span>
                    <span>Courier: {order.courier}</span>
                    <span>Tracking: {order.trackingId}</span>
                    <span>Dispatch: {formatDate(order.dispatchDate)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Communication Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentCustomer.orders.map((order) => (
                <div key={order.id} className="flex gap-3">
                  <div className="mt-1 size-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {order.status === "WhatsApp Sent"
                        ? "WhatsApp message sent"
                        : order.dispatchDate
                          ? "Tracking shared"
                          : "Order communication pending"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.orderId} • Dispatch {formatDate(order.dispatchDate)} • Tracking{" "}
                      {order.trackingId || "Not shared"}
                    </p>
                  </div>
                </div>
              ))}
              {currentCustomer.notes.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <StickyNote className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Internal note</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(item.createdAt)} • {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Favorite Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatCard label="Most Ordered Product" value={currentCustomer.preferredProduct} />
              <StatCard label="Most Ordered Size" value={currentCustomer.preferredSize} />
              <StatCard label="Most Ordered Category" value={currentCustomer.preferredCategory} />
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Customer Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {customerTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(currentCustomer.id, tag)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    currentCustomer.tags.includes(tag)
                      ? "border-primary/20 bg-primary/10 text-primary dark:text-emerald-100"
                      : "border-border bg-background/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {tag}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-28 w-full rounded-lg border border-input bg-white/70 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/[0.04]"
                placeholder="Add an internal note"
              />
              <Button type="button" className="w-full" onClick={handleAddNote}>
                Add Note
              </Button>
              {currentCustomer.notes.map((item) => (
                <div key={item.id} className="rounded-lg bg-muted/70 p-3">
                  <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                  <p className="mt-1 text-sm text-foreground">{item.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/brand-studio")}>
                <PackageCheck />
                Generate Order Card
              </Button>
              <Button type="button" variant="outline" onClick={() => copyText(getDeliveryAddress(latestOrder))}>
                <Copy />
                Copy Address
              </Button>
              <Button type="button" variant="outline" onClick={() => copyText(currentCustomer.phoneNumber)}>
                <Copy />
                Copy Phone Number
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </motion.div>
  );
}
