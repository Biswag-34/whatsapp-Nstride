import {
  ClipboardList,
  History,
  LayoutDashboard,
  MessageSquareText,
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
  { href: "/import-center", icon: UploadCloud, label: "Import Center" },
  { href: "/dispatch-queue", icon: ClipboardList, label: "Dispatch Queue" },
  { href: "/dispatch-history", icon: History, label: "Dispatch History" },
  { href: "/templates", icon: MessageSquareText, label: "Templates" },
  { href: "/settings", icon: Settings, label: "Settings" },
];
