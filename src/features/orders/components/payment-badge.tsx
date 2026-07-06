import { CreditCard, Landmark, ReceiptIndianRupee, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PaymentMode } from "@/features/orders/types";

interface PaymentBadgeProps {
  paymentMode: PaymentMode;
}

const icons = {
  COD: ReceiptIndianRupee,
  Prepaid: WalletCards,
  UPI: Landmark,
  Card: CreditCard,
};

export function PaymentBadge({ paymentMode }: PaymentBadgeProps) {
  const Icon = icons[paymentMode];

  return (
    <Badge variant="slate" className="gap-1.5 whitespace-nowrap">
      <Icon className="size-3.5" />
      {paymentMode}
    </Badge>
  );
}
