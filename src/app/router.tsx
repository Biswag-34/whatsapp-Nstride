import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { BrandStudioPage } from "@/pages/brand-studio-page";
import { CustomerProfilePage } from "@/pages/customer-profile-page";
import { CustomersPage } from "@/pages/customers-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { ImportCenterPage } from "@/pages/import-center-page";
import { OrdersPage } from "@/pages/orders-page";
import { PlaceholderPage } from "@/pages/placeholder-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <Navigate to="/" replace />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "import-center",
        element: <ImportCenterPage />,
      },
      {
        path: "brand-studio",
        element: <BrandStudioPage />,
      },
      {
        path: "customers",
        element: <CustomersPage />,
      },
      {
        path: "customers/:customerId",
        element: <CustomerProfilePage />,
      },
      {
        path: "whatsapp",
        element: <PlaceholderPage title="WhatsApp" />,
      },
      {
        path: "templates",
        element: <PlaceholderPage title="Templates" />,
      },
      {
        path: "reports",
        element: <PlaceholderPage title="Reports" />,
      },
      {
        path: "settings",
        element: <PlaceholderPage title="Settings" />,
      },
    ],
  },
]);
