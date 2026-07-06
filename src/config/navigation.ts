import {
  BarChart3,
  Boxes,
  Brush,
  FileUp,
  Gauge,
  MessageCircle,
  Settings,
  ShoppingBag,
  UsersRound,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: Gauge,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    label: "Import Center",
    href: "/import-center",
    icon: FileUp,
  },
  {
    label: "Brand Studio",
    href: "/brand-studio",
    icon: Brush,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: UsersRound,
  },
  {
    label: "WhatsApp",
    href: "/whatsapp",
    icon: MessageCircle,
  },
  {
    label: "Templates",
    href: "/templates",
    icon: WandSparkles,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const quickActions = [
  {
    label: "Create order",
    description: "Start a new patient shipment",
    icon: ShoppingBag,
  },
  {
    label: "Import customers",
    description: "Upload a verified care list",
    icon: UsersRound,
  },
  {
    label: "Send update",
    description: "Queue WhatsApp notifications",
    icon: MessageCircle,
  },
  {
    label: "Check inventory",
    description: "Review protection stock",
    icon: Boxes,
  },
];
