import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/pages/dashboard-page";
import { DispatchHistoryPage } from "@/pages/dispatch-history-page";
import { DispatchQueuePage } from "@/pages/dispatch-queue-page";
import { ImportCenterPage } from "@/pages/import-center-page";
import { OrdersPage } from "@/pages/orders-page";
import { SettingsPage } from "@/pages/settings-page";
import { TemplatesPage } from "@/pages/templates-page";

export const router = createBrowserRouter([
  {
    children: [
      { element: <DashboardPage />, index: true },
      { element: <OrdersPage />, path: "orders" },
      { element: <ImportCenterPage />, path: "import-center" },
      { element: <DispatchQueuePage />, path: "dispatch-queue" },
      { element: <DispatchHistoryPage />, path: "dispatch-history" },
      { element: <TemplatesPage />, path: "templates" },
      { element: <SettingsPage />, path: "settings" },
      { element: <Navigate replace to="/" />, path: "*" },
    ],
    element: <AppShell />,
  },
]);
