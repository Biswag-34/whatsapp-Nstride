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
import { ArrowUpDown, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { PaymentPill, StatusPill } from "@/components/dispatch/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DispatchOrder } from "@/features/dispatch/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DispatchOrdersTableProps {
  emptyText: string;
  onSendWhatsApp?: (order: DispatchOrder) => void;
  orders: DispatchOrder[];
}

function SortButton({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className="size-3.5 text-muted-foreground" />
    </span>
  );
}

export function DispatchOrdersTable({
  emptyText,
  onSendWhatsApp,
  orders,
}: DispatchOrdersTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<DispatchOrder>[]>(
    () => [
      {
        accessorKey: "shopdeckOrderId",
        header: ({ column }) => (
          <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <SortButton label="Order" />
          </button>
        ),
      },
      {
        accessorKey: "customerName",
        header: ({ column }) => (
          <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <SortButton label="Customer" />
          </button>
        ),
      },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "product", header: "Product" },
      {
        accessorKey: "amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
        header: ({ column }) => (
          <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <SortButton label="Amount" />
          </button>
        ),
      },
      {
        accessorKey: "paymentType",
        cell: ({ row }) => <PaymentPill payment={row.original.paymentType} />,
        header: "Payment",
      },
      { accessorKey: "courier", header: "Courier" },
      { accessorKey: "trackingId", header: "Tracking" },
      {
        accessorKey: "status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
        header: "Status",
      },
      {
        accessorKey: "orderDate",
        cell: ({ row }) => formatDate(row.original.orderDate),
        header: ({ column }) => (
          <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <SortButton label="Date" />
          </button>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) =>
          onSendWhatsApp ? (
            <Button size="sm" onClick={() => onSendWhatsApp(row.original)}>
              <MessageCircle />
              Send
            </Button>
          ) : null,
        header: "",
      },
    ],
    [onSendWhatsApp],
  );
  const table = useReactTable({
    columns,
    data: orders,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: { globalFilter, sorting },
  });

  return (
    <Card className="glass-panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Search orders"
          className="max-w-sm bg-background/65"
        />
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} rows
        </div>
      </div>
      <div className="max-w-full overflow-auto">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-normal text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-muted-foreground">
                  {emptyText}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 hover:bg-muted/35">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="max-w-56 truncate px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border p-4">
        <Button
          variant="outline"
          size="sm"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Next
        </Button>
      </div>
    </Card>
  );
}
