import { toJpeg, toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function downloadElementPng(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
  });

  downloadDataUrl(dataUrl, filename);
}

export async function downloadElementJpg(element: HTMLElement, filename: string) {
  const dataUrl = await toJpeg(element, {
    backgroundColor: "#ffffff",
    cacheBust: true,
    pixelRatio: 2,
    quality: 0.96,
  });

  downloadDataUrl(dataUrl, filename);
}

export async function downloadElementPdf(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    backgroundColor: "#ffffff",
    cacheBust: true,
    pixelRatio: 2,
  });
  const pdf = new jsPDF({
    format: "a4",
    orientation: "portrait",
    unit: "mm",
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const image = new Image();

  image.src = dataUrl;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const imageRatio = image.width / image.height;
  const targetWidth = pageWidth - 20;
  const targetHeight = Math.min(targetWidth / imageRatio, pageHeight - 20);
  const x = (pageWidth - targetWidth) / 2;
  const y = 10;

  pdf.addImage(dataUrl, "PNG", x, y, targetWidth, targetHeight);
  pdf.save(filename);
}

export async function copyElementAsImage(element: HTMLElement) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
  });
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}

export async function shareElement(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
  });
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], filename, { type: blob.type });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "N-Stride order asset",
      text: "Generated with N-Stride Brand Studio",
    });
    return true;
  }

  return false;
}

export function printElement(element: HTMLElement) {
  const printWindow = window.open("", "_blank", "width=900,height=1100");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>N-Stride Print Asset</title>
        <style>
          body { margin: 0; background: #ffffff; font-family: Inter, Arial, sans-serif; }
          .print-root { padding: 24px; }
        </style>
      </head>
      <body>
        <div class="print-root">${element.outerHTML}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = filename;
  link.click();
}
