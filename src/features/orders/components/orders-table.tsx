import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { OrderCard } from "@/features/orders/components/order-card";
import { PaymentBadge } from "@/features/orders/components/payment-badge";
import { StatusBadge } from "@/features/orders/components/status-badge";
import type { Order } from "@/features/orders/types";
import {
  downloadCsv,
  formatCurrency,
  formatDate,
  orderToCsvRow,
} from "@/features/orders/utils/order-formatters";
import { cn } from "@/lib/utils";

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onOpenOrder: (order: Order) => void;
}

const csvHeaders = [
  "Order ID",
  "Customer Name",
  "Mobile Number",
  "Product",
  "Category",
  "Size",
  "Quantity",
  "Amount",
  "Payment Mode",
  "Courier",
  "Tracking ID",
  "Status",
  "Order Date",
];

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") {
    return <ArrowUp className="size-3.5" />;
  }

  if (direction === "desc") {
    return <ArrowDown className="size-3.5" />;
  }

  return <ArrowUpDown className="size-3.5 opacity-55" />;
}

function EmptyState() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Search className="size-6" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-foreground">No orders found</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Try adjusting the search, clearing a column filter, or creating a new order.
      </p>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border">
          {Array.from({ length: 14 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function OrdersTable({ orders, isLoading, onOpenOrder }: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderId",
        header: "Order ID",
        cell: ({ row }) => (
          <span className="font-semibold text-primary">{row.original.orderId}</span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
      },
      {
        accessorKey: "mobileNumber",
        header: "Mobile Number",
      },
      {
        accessorKey: "product",
        header: "Product",
        cell: ({ row }) => (
          <span className="block min-w-52 truncate">{row.original.product}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "size",
        header: "Size",
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: "paymentMode",
        header: "Payment Mode",
        cell: ({ row }) => <PaymentBadge paymentMode={row.original.paymentMode} />,
      },
      {
        accessorKey: "courier",
        header: "Courier",
      },
      {
        accessorKey: "trackingId",
        header: "Tracking ID",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "orderDate",
        header: "Order Date",
        cell: ({ row }) => formatDate(row.original.orderDate),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={(event) => event.stopPropagation()}
                aria-label={`Actions for ${row.original.orderId}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenOrder(row.original);
                }}
              >
                <Eye className="size-4" />
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onOpenOrder],
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const value = String(filterValue).toLowerCase();

      return [
        row.original.orderId,
        row.original.customerName,
        row.original.mobileNumber,
        row.original.product,
        row.original.category,
        row.original.courier,
        row.original.trackingId,
        row.original.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pagedRows = table.getRowModel().rows;
  const filteredRows = table.getFilteredRowModel().rows;

  function exportCsv() {
    const rows = filteredRows.map((row) => orderToCsvRow(row.original));
    downloadCsv("n-stride-orders.csv", [csvHeaders, ...rows]);
  }

  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-border">
      <div className="space-y-4 border-b border-border p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="bg-white/70 pl-9 dark:bg-white/[0.04]"
              placeholder="Search orders, customers, mobile, product, courier"
              aria-label="Search orders"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  <SlidersHorizontal />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      className="capitalize"
                    >
                      {column.columnDef.header?.toString() ?? column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button type="button" variant="outline" onClick={exportCsv}>
              <Download />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["customerName", "Customer"],
            ["product", "Product"],
            ["status", "Status"],
            ["paymentMode", "Payment"],
            ["courier", "Courier"],
          ].map(([columnId, label]) => (
            <Input
              key={columnId}
              value={(table.getColumn(columnId)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(columnId)?.setFilterValue(event.target.value)
              }
              className="bg-white/60 dark:bg-white/[0.04]"
              placeholder={`Filter ${label}`}
              aria-label={`Filter ${label}`}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <div className="max-h-[620px] overflow-auto">
          <table className="w-full min-w-[1500px] border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const direction = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className="border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground"
                      >
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "flex items-center gap-2 whitespace-nowrap text-left",
                            canSort && "transition-colors hover:text-foreground",
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort ? <SortIcon direction={direction} /> : null}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? <SkeletonRows /> : null}
              {!isLoading && pagedRows.length > 0
                ? pagedRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => onOpenOrder(row.original)}
                      className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="border-b border-border px-4 py-4 align-middle text-foreground"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
        {!isLoading && pagedRows.length === 0 ? <EmptyState /> : null}
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-52 animate-pulse rounded-xl bg-muted" />
            ))
          : pagedRows.map((row) => (
              <OrderCard key={row.id} order={row.original} onOpen={onOpenOrder} />
            ))}
        {!isLoading && pagedRows.length === 0 ? <EmptyState /> : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="slate">{filteredRows.length} matching orders</Badge>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
