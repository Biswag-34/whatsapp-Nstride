import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppSettings } from "@/features/dispatch/types";
import { canUseIndexedDb } from "@/features/storage/db";
import { useDispatchStore } from "@/stores/use-dispatch-store";

const settingsSchema = z.object({
  supportPhone: z.string().min(6, "Support phone is required."),
  website: z.string().url("Website must be a valid URL."),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const settings = useDispatchStore((state) => state.settings);
  const saveSettings = useDispatchStore((state) => state.saveSettings);
  const form = useForm<SettingsForm>({
    defaultValues: settings,
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    form.reset(settings);
  }, [form, settings]);

  function onSubmit(values: SettingsForm) {
    const nextSettings: AppSettings = { ...settings, ...values };
    void saveSettings(nextSettings);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Device-local configuration for dispatch operations.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Brand & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <label className="block text-sm font-medium">
                Support Phone
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-input bg-background/70 px-3 outline-none focus:ring-2 focus:ring-ring"
                  {...form.register("supportPhone")}
                />
              </label>
              <label className="block text-sm font-medium">
                Website
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-input bg-background/70 px-3 outline-none focus:ring-2 focus:ring-ring"
                  {...form.register("website")}
                />
              </label>
              <p className="text-sm text-red-500">
                {form.formState.errors.supportPhone?.message || form.formState.errors.website?.message}
              </p>
              <Button type="submit">
                <Save />
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Primary storage: {canUseIndexedDb() ? "IndexedDB via Dexie" : "LocalStorage fallback"}</p>
            <p>No backend, cloud sync, Firebase, or external database is configured.</p>
            <p>Keyboard shortcuts: / focuses search, t toggles theme.</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
