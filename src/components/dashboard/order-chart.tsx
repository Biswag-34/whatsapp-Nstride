import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { weeklyOrders } from "@/features/dashboard/data/mock-dashboard";

export function OrderChart() {
  const maxOrders = Math.max(...weeklyOrders.map((item) => item.orders));

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Orders This Week</CardTitle>
          <div className="rounded-md border border-border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Live mock data
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-end gap-3">
          {weeklyOrders.map((item) => (
            <div key={item.day} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-3">
              <div className="relative flex flex-1 items-end rounded-lg bg-muted/80">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-primary to-secondary shadow-sm"
                  style={{ height: `${(item.orders / maxOrders) * 100}%` }}
                  aria-label={`${item.day}: ${item.orders} orders`}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{item.day}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.orders}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
