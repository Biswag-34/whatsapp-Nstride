import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Download, MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { OrderDrawer } from "@/components/dispatch/order-drawer";
import { WhatsAppDispatchModal } from "@/components/dispatch/whatsapp-dispatch-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOrderVariant, getWhatsAppStatus } from "@/features/dispatch/services/operations";
import type { CommunicationMessage, DispatchOrder } from "@/features/dispatch/types";
import { cn, formatDate } from "@/lib/utils";
import { useDispatchStore } from "@/stores/use-dispatch-store";

const csvHeaders = ["Purchase Date", "Order ID", "Customer", "Phone Number", "Purchase Item", "Status"];

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function itemSummary(order: DispatchOrder) {
  return `${order.product} | ${getOrderVariant(order)} | Size ${order.size || "NA"} | Qty ${order.quantity}`;
}

function getMessageStatus(order: DispatchOrder, messageHistory: CommunicationMessage[]) {
  const lastMessage = messageHistory
    .filter((message) => message.orderId === order.orderId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (order.whatsappSentAt || getWhatsAppStatus(order) === "Sent") {
    return {
      label: `Sent - ${lastMessage?.templateName ?? "Dispatch"}`,
      state: "sent",
    };
  }

  if (order.whatsappOpenedAt) {
    return { label: "Opened in WhatsApp", state: "opened" };
  }

  return { label: "Pending", state: "pending" };
}

function downloadOrdersCsv(orders: DispatchOrder[], messageHistory: CommunicationMessage[]) {
  const rows = orders.map((order) => [
    order.orderDate,
    order.orderId,
    order.customerName,
    order.phone,
    itemSummary(order),
    getMessageStatus(order, messageHistory).label,
  ]);
  const csv = [csvHeaders, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `n-stride-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrdersPage() {
  const allOrders = useDispatchStore((state) => state.orders);
  const messageHistory = useDispatchStore((state) => state.messageHistory);
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder>();
  const [dispatchOrder, setDispatchOrder] = useState<DispatchOrder>();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: "orderDate" }]);
  const [messageStatusFilter, setMessageStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const filteredOrders = useMemo(
    () =>
      allOrders.filter((order) => {
        const orderDate = order.orderDate.slice(0, 10);
        const currentStatus = getMessageStatus(order, messageHistory).state;
        const matchesMessageStatus = messageStatusFilter === "all" || currentStatus === messageStatusFilter;
        const matchesFrom = !fromDate || orderDate >= fromDate;
        const matchesTo = !toDate || orderDate <= toDate;

        return matchesMessageStatus && matchesFrom && matchesTo;
      }),
    [allOrders, fromDate, messageHistory, messageStatusFilter, toDate],
  );

  const columns = useMemo<ColumnDef<DispatchOrder>[]>(
    () => [
      {
        accessorKey: "orderDate",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm" title={row.original.orderDate}>
            {formatDate(row.original.orderDate)}
          </span>
        ),
        header: "Purchase Date",
      },
      {
        accessorKey: "orderId",
        cell: ({ row }) => <span className="font-medium">{row.original.orderId}</span>,
        header: "Order ID",
      },
      {
        id: "customer",
        cell: ({ row }) => (
          <div className="min-w-0">
            <button
              type="button"
              className="max-w-full truncate text-left font-medium hover:text-primary"
              onClick={() => setSelectedOrder(row.original)}
            >
              {row.original.customerName}
            </button>
            <p className="truncate text-xs text-muted-foreground">{row.original.phone}</p>
          </div>
        ),
        header: "Customer / Phone",
      },
      {
        id: "purchaseItem",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.product}</p>
            <p className="truncate text-xs text-muted-foreground">
              {getOrderVariant(row.original)} - Size {row.original.size || "NA"} - Qty {row.original.quantity}
            </p>
          </div>
        ),
        header: "Purchase Item",
      },
      {
        accessorKey: "status",
        cell: ({ row }) => {
          const messageStatus = getMessageStatus(row.original, messageHistory);
          const variant =
            messageStatus.state === "sent"
              ? "success"
              : messageStatus.state === "opened"
                ? "default"
                : "warning";

          return (
            <Badge variant={variant}>
              {messageStatus.label}
            </Badge>
          );
        },
        header: "Status",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const whatsappStatus = getWhatsAppStatus(row.original);
          const messageStatus = getMessageStatus(row.original, messageHistory);

          return (
            <Button
              size="sm"
              variant={whatsappStatus === "Sent" ? "secondary" : "default"}
              onClick={() => setDispatchOrder(row.original)}
              className={cn("w-full", whatsappStatus === "Sent" && "pointer-events-none")}
            >
              <MessageCircle />
              {whatsappStatus === "Sent" ? "Sent" : messageStatus.state === "opened" ? "Opened" : "WhatsApp"}
            </Button>
          );
        },
        header: "WhatsApp",
      },
    ],
    [messageHistory],
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

      return [order.orderId, order.customerName, order.phone, order.product, getOrderVariant(order)]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: { globalFilter, sorting },
  });
  const visibleOrders = table.getFilteredRowModel().rows.map((row) => row.original);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Orders</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">Shopdeck order operations</h1>
      </div>

      <Card className="glass-panel p-4">
        <div className="grid gap-3 md:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Search order, customer, phone, item"
              className="pl-9"
            />
          </div>
          <select
            className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm"
            value={messageStatusFilter}
            onChange={(event) => setMessageStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="opened">Opened in WhatsApp</option>
            <option value="sent">Sent</option>
          </select>
          <input
            className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm"
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="h-10 rounded-lg border border-input bg-background/70 px-3 text-sm"
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
          <div className="flex items-center justify-end text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} orders
          </div>
        </div>
      </Card>

      <Card className="glass-panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadOrdersCsv(visibleOrders, messageHistory)}
            disabled={visibleOrders.length === 0}
          >
            <Download />
            Export CSV
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">{visibleOrders.length} visible</span>
        </div>
        <div className="max-w-full overflow-x-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[13%]" />
              <col className="w-[18%]" />
              <col className="w-[19%]" />
              <col className="w-[25%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
            </colgroup>
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
                    <td key={cell.id} className="truncate px-3 py-3 align-middle">
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
