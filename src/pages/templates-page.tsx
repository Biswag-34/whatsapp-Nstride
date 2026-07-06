import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultMessageTemplates } from "@/features/dispatch/services/template-engine";
import type { MessageTemplate, MessageTemplateType } from "@/features/dispatch/types";
import { cn } from "@/lib/utils";
import { useDispatchStore } from "@/stores/use-dispatch-store";

const templateTypes: Array<{ label: string; value: MessageTemplateType }> = [
  { label: "Default Dispatch", value: "default_dispatch" },
  { label: "Delivered", value: "delivered" },
  { label: "Tracking Updated", value: "tracking_updated" },
  { label: "Delay Notification", value: "delay_notification" },
  { label: "Replacement", value: "replacement" },
  { label: "Exchange", value: "exchange" },
  { label: "Return", value: "return" },
];

const templateSchema = z.object({
  body: z.string().min(20, "Template is too short."),
  name: z.string().min(2, "Name is required."),
  type: z.enum([
    "default_dispatch",
    "delivered",
    "tracking_updated",
    "delay_notification",
    "replacement",
    "exchange",
    "return",
  ]),
});

type TemplateForm = z.infer<typeof templateSchema>;

const variables = [
  "{{Customer}}",
  "{{OrderID}}",
  "{{Product}}",
  "{{Variant}}",
  "{{Size}}",
  "{{Quantity}}",
  "{{Amount}}",
  "{{Payment}}",
  "{{Courier}}",
  "{{Tracking}}",
  "{{TrackingURL}}",
  "{{Address}}",
];

export function TemplatesPage() {
  const templates = useDispatchStore((state) => state.templates);
  const saveTemplate = useDispatchStore((state) => state.saveTemplate);
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? defaultMessageTemplates[0].id);
  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedId) ??
      defaultMessageTemplates.find((template) => template.id === selectedId) ??
      templates[0] ??
      defaultMessageTemplates[0],
    [selectedId, templates],
  );
  const form = useForm<TemplateForm>({
    defaultValues: {
      body: selectedTemplate.body,
      name: selectedTemplate.name,
      type: selectedTemplate.type ?? "default_dispatch",
    },
    resolver: zodResolver(templateSchema),
  });

  useEffect(() => {
    form.reset({
      body: selectedTemplate.body,
      name: selectedTemplate.name,
      type: selectedTemplate.type ?? "default_dispatch",
    });
  }, [form, selectedTemplate]);

  function onSubmit(values: TemplateForm) {
    const nextTemplate: MessageTemplate = {
      ...selectedTemplate,
      ...values,
      isDefault: values.type === "default_dispatch",
      updatedAt: new Date().toISOString(),
    };
    void saveTemplate(nextTemplate);
  }

  function createCustomTemplate() {
    const id = crypto.randomUUID();
    const template: MessageTemplate = {
      body: defaultMessageTemplates[0].body,
      id,
      isDefault: false,
      name: "Custom Dispatch Template",
      type: "default_dispatch",
      updatedAt: new Date().toISOString(),
    };
    void saveTemplate(template);
    setSelectedId(id);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Template Manager</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage IndexedDB-backed WhatsApp templates with supported variables.
          </p>
        </div>
        <Button onClick={createCustomTemplate}>
          <Plus />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[19rem_1fr]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={cn(
                  "w-full rounded-lg border border-border p-3 text-left text-sm transition hover:bg-muted/60",
                  selectedTemplate.id === template.id && "border-primary bg-primary/10 text-primary",
                )}
                onClick={() => setSelectedId(template.id)}
              >
                <span className="block font-medium">{template.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {templateTypes.find((type) => type.value === template.type)?.label ?? "Template"}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{selectedTemplate.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Template Name
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background/70 px-3 outline-none focus:ring-2 focus:ring-ring"
                    {...form.register("name")}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Template Type
                  <select
                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background/70 px-3 outline-none focus:ring-2 focus:ring-ring"
                    {...form.register("type")}
                  >
                    {templateTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Variables</p>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      className="rounded-md border border-border bg-muted/55 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                      onClick={() => {
                        const current = form.getValues("body");
                        form.setValue("body", `${current}${current.endsWith("\n") ? "" : "\n"}${variable}`);
                      }}
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-medium">
                Message Body
                <textarea
                  className="mt-2 min-h-96 w-full rounded-lg border border-input bg-background/70 p-3 font-mono text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
                  {...form.register("body")}
                />
              </label>
              <p className="text-sm text-red-500">
                {form.formState.errors.body?.message ||
                  form.formState.errors.name?.message ||
                  form.formState.errors.type?.message}
              </p>
              <Button type="submit">
                <Save />
                Save Template
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
