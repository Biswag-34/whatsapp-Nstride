import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MessageTemplate } from "@/features/dispatch/types";
import { useDispatchStore } from "@/stores/use-dispatch-store";

const templateSchema = z.object({
  body: z.string().min(20, "Template is too short."),
  name: z.string().min(2, "Name is required."),
});

type TemplateForm = z.infer<typeof templateSchema>;

export function TemplatesPage() {
  const template = useDispatchStore(
    (state) => state.templates.find((item) => item.isDefault) ?? state.templates[0],
  );
  const saveTemplate = useDispatchStore((state) => state.saveTemplate);
  const form = useForm<TemplateForm>({
    defaultValues: { body: template.body, name: template.name },
    resolver: zodResolver(templateSchema),
  });

  useEffect(() => {
    form.reset({ body: template.body, name: template.name });
  }, [form, template.body, template.name]);

  function onSubmit(values: TemplateForm) {
    const nextTemplate: MessageTemplate = { ...template, ...values, isDefault: true };
    void saveTemplate(nextTemplate);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Templates</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Control the dispatch message sent through WhatsApp.
        </p>
      </div>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Default WhatsApp Dispatch Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="block text-sm font-medium">
              Template Name
              <input
                className="mt-2 h-10 w-full rounded-lg border border-input bg-background/70 px-3 outline-none focus:ring-2 focus:ring-ring"
                {...form.register("name")}
              />
            </label>
            <label className="block text-sm font-medium">
              Message Body
              <textarea
                className="mt-2 min-h-96 w-full rounded-lg border border-input bg-background/70 p-3 font-mono text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
                {...form.register("body")}
              />
            </label>
            <p className="text-sm text-red-500">
              {form.formState.errors.body?.message || form.formState.errors.name?.message}
            </p>
            <Button type="submit">
              <Save />
              Save Template
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
