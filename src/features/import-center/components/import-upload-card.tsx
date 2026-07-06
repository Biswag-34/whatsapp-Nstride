import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImportUploadCardProps {
  fileName?: string;
  isParsing: boolean;
  onFileSelected: (file: File) => void;
}

export function ImportUploadCard({
  fileName,
  isParsing,
  onFileSelected,
}: ImportUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Import Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 p-6 text-center transition-all",
            isDragging && "border-primary bg-primary/5",
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UploadCloud className="size-7" />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-normal text-foreground">
            Drag & drop Shopdeck export
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Upload CSV or Excel files. Orders are shown in preview first and are not saved
            until you confirm the import.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isParsing}
            >
              <FileSpreadsheet />
              Browse Files
            </Button>
            {fileName ? (
              <span className="rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                {isParsing ? "Parsing..." : fileName}
              </span>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
