import { Grid2X2, Search, Table2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerCard } from "@/features/customers/components/customer-card";
import { CustomerDashboardWidgets } from "@/features/customers/components/customer-dashboard-widgets";
import { CustomerFiltersPanel } from "@/features/customers/components/customer-filters";
import { CustomersTable } from "@/features/customers/components/customers-table";
import type { CustomerFilters } from "@/features/customers/types";
import { buildCustomerProfiles } from "@/features/customers/utils/customer-analytics";
import { cn } from "@/lib/utils";
import { useCustomersStore } from "@/stores/use-customers-store";
import { useOrdersStore } from "@/stores/use-orders-store";

const defaultFilters: CustomerFilters = {
  vipOnly: false,
  repeatOnly: false,
  codOnly: false,
  prepaidOnly: false,
  city: "",
  state: "",
  minRevenue: "",
  minOrders: "",
};

export function CustomersPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [filters, setFilters] = useState<CustomerFilters>(defaultFilters);
  const orders = useOrdersStore((state) => state.orders);
  const customerCrm = useCustomersStore((state) => state.customers);
  const customers = useMemo(
    () => buildCustomerProfiles(orders, customerCrm),
    [customerCrm, orders],
  );
  const cities = useMemo(
    () => Array.from(new Set(customers.map((customer) => customer.city).filter(Boolean))).sort(),
    [customers],
  );
  const states = useMemo(
    () =>
      Array.from(new Set(customers.map((customer) => customer.state).filter(Boolean))).sort(),
    [customers],
  );
  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    const minRevenue = Number(filters.minRevenue || 0);
    const minOrders = Number(filters.minOrders || 0);

    return customers.filter((customer) => {
      const matchesQuery = [
        customer.customerName,
        customer.phoneNumber,
        customer.city,
        customer.state,
        customer.preferredProduct,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesVip = !filters.vipOnly || customer.tags.includes("VIP");
      const matchesRepeat = !filters.repeatOnly || customer.totalOrders > 1;
      const matchesCod =
        !filters.codOnly || customer.paymentModes.every((mode) => mode === "COD");
      const matchesPrepaid =
        !filters.prepaidOnly || !customer.paymentModes.includes("COD");
      const matchesCity = !filters.city || customer.city === filters.city;
      const matchesState = !filters.state || customer.state === filters.state;
      const matchesRevenue = customer.totalRevenue >= minRevenue;
      const matchesOrders = customer.totalOrders >= minOrders;

      return (
        matchesQuery &&
        matchesVip &&
        matchesRepeat &&
        matchesCod &&
        matchesPrepaid &&
        matchesCity &&
        matchesState &&
        matchesRevenue &&
        matchesOrders
      );
    });
  }, [customers, filters, query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      <section className="glass-panel rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              Customers
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Customer profiles are automatically created from orders and merged by phone
              number, including imported Shopdeck orders.
            </p>
          </div>
          <div className="flex rounded-xl border border-border bg-background/60 p-1 dark:bg-white/[0.03]">
            {[
              ["grid", Grid2X2, "Grid View"],
              ["table", Table2, "Table View"],
            ].map(([value, Icon, label]) => (
              <Button
                key={value as string}
                type="button"
                variant={view === value ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(value as "grid" | "table")}
              >
                <Icon className="size-4" />
                {label as string}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <CustomerDashboardWidgets customers={customers} />

      <div className="glass-panel rounded-2xl border border-border p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="bg-white/70 pl-9 dark:bg-white/[0.04]"
            placeholder="Search customers, phone, city, product"
          />
        </div>
      </div>

      <CustomerFiltersPanel
        filters={filters}
        onChange={setFilters}
        cities={cities}
        states={states}
      />

      <div className={cn(view === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "")}>
        {view === "grid" ? (
          filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))
        ) : (
          <CustomersTable customers={filteredCustomers} />
        )}
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-border p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">No customers found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try clearing filters or importing orders with customer details.
          </p>
        </div>
      ) : null}
    </motion.div>
  );
}
