import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { Download, MessageCircle, Printer, Search, SquareStack } from "lucide-react";
import { useMemo, useState } from "react";

import { OrderDrawer } from "@/components/dispatch/order-drawer";
import { PaymentPill, StatusPill } from "@/components/dispatch/status-pill";
import { WhatsAppDispatchModal } from "@/components/dispatch/whatsapp-dispatch-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOrderVariant, getSourceValue, getWhatsAppStatus } from "@/features/dispatch/services/operations";
import type { DispatchOrder } from "@/features/dispatch/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useDispatchStore } from "@/stores/use-dispatch-store";

const csvHeaders = [
  "Order ID",
  "Customer",
  "Phone",
  "Product",
  "Variant",
  "Size",
  "Quantity",
  "Amount",
  "Payment",
  "Courier",
  "Tracking ID",
  "Dispatch Status",
  "WhatsApp Status",
  "Call Status",
  "Call Remarks",
  "Shopdeck Order Date",
  "Imported At",
];

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadOrdersCsv(orders: DispatchOrder[]) {
  const rows = orders.map((order) => [
    order.orderId,
    order.customerName,
    order.phone,
    order.product,
    getOrderVariant(order),
    order.size,
    order.quantity,
    order.amount,
    order.paymentType,
    order.courier,
    order.trackingId,
    order.status,
    getWhatsAppStatus(order),
    getSourceValue(order, "Call Status"),
    getSourceValue(order, "Call Remarks"),
    order.orderDate,
    order.createdAt,
  ]);
  const csv = [csvHeaders, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `n-stride-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function printPackingSlips(orders: DispatchOrder[]) {
  const printable = orders
    .map(
      (order) => `
      <section>
        <h2>${order.orderId}</h2>
        <p><strong>${order.customerName}</strong> - ${order.phone}</p>
        <p>${order.address}</p>
        <p>${order.city}, ${order.state} - ${order.pinCode}</p>
        <hr />
        <p>${order.product} | ${getOrderVariant(order)} | Size ${order.size} | Qty ${order.quantity}</p>
        <p>Courier: ${order.courier || "Not set"}</p>
        <p>Tracking: ${order.trackingId || "Missing"}</p>
      </section>`,
    )
    .join("");
  const win = window.open("", "_blank", "noopener,noreferrer");

  if (win) {
    win.document.write(`
      <html>
        <head>
          <title>N-Stride Packing Slips</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; }
            section { break-after: page; padding: 24px; border: 1px solid #d1d5db; margin: 16px; }
            h2 { margin: 0 0 12px; font-size: 22px; }
            p { margin: 8px 0; font-size: 14px; }
          </style>
        </head>
        <body>${printable}</body>
      </html>
    `);
    win.document.close();
    win.print();
  }
}

export function OrdersPage() {
  const allOrders = useDispatchStore((state) => state.orders);
  const markWhatsAppSent = useDispatchStore((state) => state.markWhatsAppSent);
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder>();
  const [dispatchOrder, setDispatchOrder] = useState<DispatchOrder>();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: "orderDate" }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [courierFilter, setCourierFilter] = useState("");
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState("all");
  const [whatsAppFilter, setWhatsAppFilter] = useState("all");
  const [callStatusFilter, setCallStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const filteredOrders = useMemo(
    () =>
      allOrders.filter((order) => {
        const orderDate = order.orderDate.slice(0, 10);
        const matchesPayment = paymentFilter === "all" || order.paymentType === paymentFilter;
        const matchesCourier =
          !courierFilter || order.courier.toLowerCase().includes(courierFilter.toLowerCase());
        const matchesDispatch = dispatchStatusFilter === "all" || order.status === dispatchStatusFilter;
        const matchesWhatsApp = whatsAppFilter === "all" || getWhatsAppStatus(order) === whatsAppFilter;
        const matchesCall =
          !callStatusFilter ||
          getSourceValue(order, "Call Status").toLowerCase().includes(callStatusFilter.toLowerCase());
        const matchesFrom = !fromDate || orderDate >= fromDate;
        const matchesTo = !toDate || orderDate <= toDate;

        return (
          matchesPayment &&
          matchesCourier &&
          matchesDispatch &&
          matchesWhatsApp &&
          matchesCall &&
          matchesFrom &&
          matchesTo
        );
      }),
    [allOrders, callStatusFilter, courierFilter, dispatchStatusFilter, fromDate, paymentFilter, toDate, whatsAppFilter],
  );

  const columns = useMemo<ColumnDef<DispatchOrder>[]>(
    () => [
      {
        id: "select",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select ${row.original.orderId}`}
          />
        ),
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select page"
          />
        ),
      },
      { accessorKey: "orderId", header: "Order ID" },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "product", header: "Product" },
      { id: "variant", cell: ({ row }) => getOrderVariant(row.original), header: "Variant" },
      { accessorKey: "size", header: "Size" },
      { accessorKey: "quantity", header: "Quantity" },
      { accessorKey: "amount", cell: ({ row }) => formatCurrency(row.original.amount), header: "Amount" },
      { accessorKey: "paymentType", cell: ({ row }) => <PaymentPill payment={row.original.paymentType} />, header: "Payment" },
      { accessorKey: "courier", header: "Courier" },
      { accessorKey: "trackingId", header: "Tracking ID" },
      { accessorKey: "status", cell: ({ row }) => <StatusPill status={row.original.status} />, header: "Dispatch Status" },
      { id: "whatsapp", cell: ({ row }) => getWhatsAppStatus(row.original), header: "WhatsApp Status" },
      { id: "callStatus", cell: ({ row }) => getSourceValue(row.original, "Call Status") || "Not set", header: "Call Status" },
      { id: "callRemarks", cell: ({ row }) => getSourceValue(row.original, "Call Remarks") || "Not set", header: "Call Remarks" },
      { accessorKey: "orderDate", cell: ({ row }) => formatDateTime(row.original.orderDate), header: "Shopdeck Order Date" },
      { accessorKey: "createdAt", cell: ({ row }) => formatDateTime(row.original.createdAt), header: "Imported At" },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(row.original)}>Open</Button>
            <Button size="sm" onClick={() => setDispatchOrder(row.original)}>Dispatch</Button>
          </div>
        ),
        header: "Actions",
      },
    ],
    [],
  );
  const table = useReactTable({
    columns,
    data: filteredOrders,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    globalFilterFn: (row, _columnId, filterValue) => {
      const needle = String(filterValue).toLowerCase();
      const order = row.original;

      return [order.orderId, order.customerName, order.phone, order.trackingId, order.product]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: { globalFilter, rowSelection, sorting },
  });
  const selectedOrders = table.getSelectedRowModel().rows.map((row) => row.original);
  const actionOrders = selectedOrders.length > 0 ? selectedOrders : table.getFilteredRowModel().rows.map((row) => row.original);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Orders</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">Shopdeck order operations</h1>
      </div>

      <Card className="glass-panel p-4">
        <div className="grid gap-3 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Search order, customer, phone, tracking, product" className="pl-9" />
          </div>
          <select className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm" value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
            <option value="all">All Payments</option>
            <option value="COD">COD</option>
            <option value="Prepaid">Prepaid</option>
          </select>
          <input className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm" placeholder="Courier" value={courierFilter} onChange={(event) => setCourierFilter(event.target.value)} />
          <select className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm" value={dispatchStatusFilter} onChange={(event) => setDispatchStatusFilter(event.target.value)}>
            <option value="all">All Dispatch</option>
            <option value="pending_dispatch">Pending Dispatch</option>
            <option value="whatsapp_ready">WhatsApp Ready</option>
            <option value="whatsapp_sent">WhatsApp Sent</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rto">RTO</option>
          </select>
          <select className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm" value={whatsAppFilter} onChange={(event) => setWhatsAppFilter(event.target.value)}>
            <option value="all">All WhatsApp</option>
            <option value="Pending">Pending</option>
            <option value="Ready">Ready</option>
            <option value="Sent">Sent</option>
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm" placeholder="Call Status" value={callStatusFilter} onChange={(event) => setCallStatusFilter(event.target.value)} />
          <input className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <input className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          <div className="flex items-center justify-end text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} orders</div>
        </div>
      </Card>

      <Card className="glass-panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <Button size="sm" onClick={() => void markWhatsAppSent(selectedOrders.map((order) => order.id))} disabled={selectedOrders.length === 0}>
            <MessageCircle />
            Mark WhatsApp Sent
          </Button>
          <Button size="sm" variant="outline" onClick={() => downloadOrdersCsv(actionOrders)} disabled={actionOrders.length === 0}>
            <Download />
            Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => void navigator.clipboard.writeText(actionOrders.map((order) => `${order.orderId}: ${order.trackingId || "Missing"}`).join("\n"))} disabled={actionOrders.length === 0}>
            <SquareStack />
            Copy Tracking
          </Button>
          <Button size="sm" variant="outline" onClick={() => printPackingSlips(actionOrders)} disabled={actionOrders.length === 0}>
            <Printer />
            Print Packing Slip
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">{selectedOrders.length} selected</span>
        </div>
        <div className="max-w-full overflow-auto">
          <table className="w-full min-w-[1680px] text-sm">
            <thead className="sticky top-0 z-10 bg-background/95 text-left text-xs uppercase text-muted-foreground backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-3 py-3 font-semibold">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 hover:bg-muted/35">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="max-w-64 truncate px-3 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-16 text-center text-muted-foreground">
                    No imported Shopdeck orders match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border p-4">
          <Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Next
          </Button>
        </div>
      </Card>

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
    </div>
  );
}
