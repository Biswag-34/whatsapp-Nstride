import {
  LayoutDashboard,
  MessageSquareText,
  PackageSearch,
  Settings,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const navigationItems: NavigationItem[] = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/orders", icon: PackageSearch, label: "Orders" },
  { href: "/import-center", icon: UploadCloud, label: "Import Center" },
  { href: "/templates", icon: MessageSquareText, label: "Templates" },
  { href: "/settings", icon: Settings, label: "Settings" },
];
