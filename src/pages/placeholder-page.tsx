import { motion } from "framer-motion";
import { Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
      className="glass-panel rounded-2xl border border-border p-8"
    >
      <div className="flex max-w-2xl flex-col gap-5">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Construction className="size-5" />
        </div>
        <div>
          <Badge variant="slate">Foundation route</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This section is routed and ready for feature modules, data loading,
            forms, tables, and permissions when the next build phase begins.
          </p>
        </div>
        <div>
          <Button variant="secondary">Architecture ready</Button>
        </div>
      </div>
    </motion.section>
  );
}
