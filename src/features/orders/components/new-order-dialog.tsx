import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  newOrderSchema,
  type NewOrderFormValues,
  type NewOrderInput,
} from "@/features/orders/schemas/order-schema";
import { cn } from "@/lib/utils";
import { useOrdersStore } from "@/stores/use-orders-store";

const defaultValues: NewOrderFormValues = {
  customerName: "",
  mobileNumber: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  product: "",
  category: "Knee Support",
  size: "M",
  quantity: 1,
  amount: 1499,
  discount: 0,
  tax: 135,
  paymentMode: "Prepaid",
  courier: "Blue Dart",
  trackingId: "",
  trackingUrl: "https://www.bluedart.com/tracking",
  status: "New",
  orderDate: new Date().toISOString().slice(0, 10),
  dispatchDate: "",
  expectedDelivery: "",
};

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  );
}

export function NewOrderDialog() {
  const [open, setOpen] = useState(false);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const formId = useMemo(() => "new-order-form", []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewOrderFormValues, unknown, NewOrderInput>({
    resolver: zodResolver(newOrderSchema),
    defaultValues,
  });

  function onSubmit(values: NewOrderInput) {
    addOrder(values);
    reset(defaultValues);
    setOpen(false);
  }

  const inputClass = "bg-white/70 dark:bg-white/[0.04]";
  const selectClass = cn(
    "h-10 rounded-lg border border-input bg-white/70 px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/[0.04]",
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] max-w-4xl overflow-hidden p-0">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription className="mt-2">
            Add a local order record. Data is persisted in this browser.
          </DialogDescription>
        </div>

        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="max-h-[calc(92dvh-150px)] overflow-y-auto px-5 py-5 sm:px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="space-y-6"
          >
            <section>
              <h3 className="text-sm font-semibold text-foreground">Customer Information</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Name" error={errors.customerName?.message}>
                  <Input className={inputClass} {...register("customerName")} />
                </Field>
                <Field label="Phone" error={errors.mobileNumber?.message}>
                  <Input className={inputClass} {...register("mobileNumber")} />
                </Field>
                <Field label="Address" error={errors.address?.message}>
                  <textarea
                    className={cn(
                      inputClass,
                      "min-h-24 rounded-lg border border-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring md:col-span-2",
                    )}
                    {...register("address")}
                  />
                </Field>
                <Field label="City" error={errors.city?.message}>
                  <Input className={inputClass} {...register("city")} />
                </Field>
                <Field label="State" error={errors.state?.message}>
                  <Input className={inputClass} {...register("state")} />
                </Field>
                <Field label="PIN Code" error={errors.pinCode?.message}>
                  <Input className={inputClass} {...register("pinCode")} />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground">Product Information</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="Product Name" error={errors.product?.message}>
                  <Input className={inputClass} {...register("product")} />
                </Field>
                <Field label="Category" error={errors.category?.message}>
                  <Input className={inputClass} {...register("category")} />
                </Field>
                <Field label="Size" error={errors.size?.message}>
                  <Input className={inputClass} {...register("size")} />
                </Field>
                <Field label="Quantity" error={errors.quantity?.message}>
                  <Input type="number" min={1} className={inputClass} {...register("quantity")} />
                </Field>
                <Field label="Amount" error={errors.amount?.message}>
                  <Input type="number" min={1} className={inputClass} {...register("amount")} />
                </Field>
                <Field label="Discount" error={errors.discount?.message}>
                  <Input type="number" min={0} className={inputClass} {...register("discount")} />
                </Field>
                <Field label="Tax" error={errors.tax?.message}>
                  <Input type="number" min={0} className={inputClass} {...register("tax")} />
                </Field>
                <Field label="Payment Mode" error={errors.paymentMode?.message}>
                  <select className={selectClass} {...register("paymentMode")}>
                    <option>Prepaid</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>COD</option>
                  </select>
                </Field>
                <Field label="Status" error={errors.status?.message}>
                  <select className={selectClass} {...register("status")}>
                    <option>Pending</option>
                    <option>New</option>
                    <option>Confirmed</option>
                    <option>WhatsApp Sent</option>
                    <option>Dispatched</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground">Shipping</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="Courier" error={errors.courier?.message}>
                  <Input className={inputClass} {...register("courier")} />
                </Field>
                <Field label="Tracking ID" error={errors.trackingId?.message}>
                  <Input className={inputClass} {...register("trackingId")} />
                </Field>
                <Field label="Tracking URL" error={errors.trackingUrl?.message}>
                  <Input className={inputClass} {...register("trackingUrl")} />
                </Field>
                <Field label="Order Date" error={errors.orderDate?.message}>
                  <Input type="date" className={inputClass} {...register("orderDate")} />
                </Field>
                <Field label="Dispatch Date" error={errors.dispatchDate?.message}>
                  <Input type="date" className={inputClass} {...register("dispatchDate")} />
                </Field>
                <Field label="Expected Delivery" error={errors.expectedDelivery?.message}>
                  <Input type="date" className={inputClass} {...register("expectedDelivery")} />
                </Field>
              </div>
            </section>
          </motion.div>
        </form>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            Create Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
