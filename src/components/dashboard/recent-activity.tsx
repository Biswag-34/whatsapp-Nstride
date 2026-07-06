import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivity } from "@/features/dashboard/data/mock-dashboard";

export function RecentActivity() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;

            return (
              <div key={activity.title} className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/12 text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {activity.title}
                    </p>
                    <p className="shrink-0 text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {activity.meta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
