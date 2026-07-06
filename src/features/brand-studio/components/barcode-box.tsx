import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

interface BarcodeBoxProps {
  value: string;
}

export function BarcodeBox({ value }: BarcodeBoxProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    JsBarcode(svgRef.current, value || "NSTRIDE", {
      background: "#ffffff",
      displayValue: true,
      font: "Inter, Arial",
      fontSize: 14,
      height: 54,
      lineColor: "#0F172A",
      margin: 8,
      width: 1.6,
    });
  }, [value]);

  return (
    <div className="rounded-lg bg-white p-2 text-slate-950">
      <svg ref={svgRef} aria-label="Tracking barcode" />
    </div>
  );
}
