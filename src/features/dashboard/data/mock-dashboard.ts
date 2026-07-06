import {
  CircleCheck,
  Clock3,
  MessageSquareText,
  PackageCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";

export const metrics = [
  {
    label: "Today's Orders",
    value: "142",
    delta: "+18.4%",
    trend: "vs. yesterday",
    icon: PackageCheck,
    tone: "primary",
  },
  {
    label: "Pending Dispatch",
    value: "27",
    delta: "-6",
    trend: "awaiting courier",
    icon: Clock3,
    tone: "amber",
  },
  {
    label: "WhatsApp Sent",
    value: "3,812",
    delta: "98.2%",
    trend: "delivery rate",
    icon: MessageSquareText,
    tone: "sky",
  },
  {
    label: "Revenue",
    value: "Rs. 8.42L",
    delta: "+12.1%",
    trend: "net collected",
    icon: WalletCards,
    tone: "slate",
  },
];

export const recentActivity = [
  {
    title: "Order NS-10482 dispatched",
    meta: "Knee support kit to Hyderabad",
    time: "2 min ago",
    icon: CircleCheck,
  },
  {
    title: "WhatsApp template approved",
    meta: "Post-purchase care instructions",
    time: "18 min ago",
    icon: MessageSquareText,
  },
  {
    title: "High-value order paid",
    meta: "Corporate wellness batch",
    time: "34 min ago",
    icon: TrendingUp,
  },
  {
    title: "Dispatch queue updated",
    meta: "Nine priority shipments moved forward",
    time: "1 hr ago",
    icon: PackageCheck,
  },
];

export const weeklyOrders = [
  { day: "Mon", orders: 86 },
  { day: "Tue", orders: 112 },
  { day: "Wed", orders: 94 },
  { day: "Thu", orders: 136 },
  { day: "Fri", orders: 158 },
  { day: "Sat", orders: 121 },
  { day: "Sun", orders: 142 },
];
