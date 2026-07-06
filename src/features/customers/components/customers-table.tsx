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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CustomerProfile } from "@/features/customers/types";
import { formatCurrency, formatDate } from "@/features/orders/utils/order-formatters";

interface CustomersTableProps {
  customers: CustomerProfile[];
}

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") {
    return <ArrowUp className="size-3.5" />;
  }

  if (direction === "desc") {
    return <ArrowDown className="size-3.5" />;
  }

  return <ArrowUpDown className="size-3.5 opacity-50" />;
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<CustomerProfile>[]>(
    () => [
      {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: ({ row }) => (
          <Link
            to={`/customers/${row.original.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.customerName}
          </Link>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone Number",
      },
      {
        accessorKey: "city",
        header: "City",
      },
      {
        accessorKey: "state",
        header: "State",
      },
      {
        accessorKey: "totalOrders",
        header: "Total Orders",
      },
      {
        accessorKey: "totalRevenue",
        header: "Total Revenue",
        cell: ({ row }) => formatCurrency(row.original.totalRevenue),
      },
      {
        accessorKey: "lastOrderDate",
        header: "Last Order Date",
        cell: ({ row }) => formatDate(row.original.lastOrderDate),
      },
      {
        accessorKey: "preferredProduct",
        header: "Preferred Product",
        cell: ({ row }) => (
          <span className="block min-w-48 truncate">{row.original.preferredProduct}</span>
        ),
      },
      {
        accessorKey: "preferredSize",
        header: "Preferred Size",
      },
      {
        accessorKey: "whatsappStatus",
        header: "WhatsApp Status",
        cell: ({ row }) => (
          <Badge variant={row.original.whatsappStatus === "Sent" ? "success" : "warning"}>
            {row.original.whatsappStatus}
          </Badge>
        ),
      },
      {
        accessorKey: "customerSince",
        header: "Customer Since",
        cell: ({ row }) => formatDate(row.original.customerSince),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Button asChild type="button" variant="ghost" size="sm">
            <Link to={`/customers/${row.original.id}`}>
              <Eye />
              View
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );
  const table = useReactTable({
    data: customers,
    columns,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-border">
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full min-w-[1450px] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground"
                  >
                    <button
                      type="button"
                      disabled={!header.column.getCanSort()}
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() ? (
                        <SortIcon direction={header.column.getIsSorted()} />
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b border-border px-4 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {customers.length} customer profiles • Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </p>
        <div className="flex gap-2">
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
