import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerFilters } from "@/features/customers/types";

interface CustomerFiltersProps {
  filters: CustomerFilters;
  onChange: (filters: CustomerFilters) => void;
  cities: string[];
  states: string[];
}

export function CustomerFiltersPanel({
  filters,
  onChange,
  cities,
  states,
}: CustomerFiltersProps) {
  function update<K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="glass-panel rounded-2xl border border-border p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="size-4 text-primary" />
        <h2 className="text-base font-semibold tracking-normal text-foreground">
          Advanced Filters
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["vipOnly", "VIP"],
          ["repeatOnly", "Repeat Customers"],
          ["codOnly", "COD Only"],
          ["prepaidOnly", "Prepaid Only"],
        ].map(([key, label]) => (
          <Button
            key={key}
            type="button"
            variant={filters[key as keyof CustomerFilters] ? "default" : "outline"}
            onClick={() =>
              update(
                key as keyof CustomerFilters,
                !filters[key as keyof CustomerFilters] as never,
              )
            }
          >
            {label}
          </Button>
        ))}
        <select
          value={filters.city}
          onChange={(event) => update("city", event.target.value)}
          className="h-10 rounded-lg border border-input bg-white/70 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/[0.04]"
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select
          value={filters.state}
          onChange={(event) => update("state", event.target.value)}
          className="h-10 rounded-lg border border-input bg-white/70 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/[0.04]"
        >
          <option value="">All states</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <Input
          type="number"
          value={filters.minRevenue}
          onChange={(event) => update("minRevenue", event.target.value)}
          placeholder="Min revenue"
          className="bg-white/70 dark:bg-white/[0.04]"
        />
        <Input
          type="number"
          value={filters.minOrders}
          onChange={(event) => update("minOrders", event.target.value)}
          placeholder="Min orders count"
          className="bg-white/70 dark:bg-white/[0.04]"
        />
      </div>
    </div>
  );
}
