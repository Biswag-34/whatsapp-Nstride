import QRCode from "qrcode";
import { useEffect, useRef } from "react";

interface QrCodeBoxProps {
  value: string;
  label?: string;
  size?: number;
}

export function QrCodeBox({ value, label, size = 132 }: QrCodeBoxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    void QRCode.toCanvas(canvasRef.current, value || "https://nstride.shop", {
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
      margin: 1,
      width: size,
    });
  }, [size, value]);

  return (
    <div className="inline-flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-3 text-slate-950 shadow-sm">
      <canvas ref={canvasRef} width={size} height={size} aria-label={label ?? "QR code"} />
      {label ? <span className="text-xs font-medium text-slate-500">{label}</span> : null}
    </div>
  );
}
