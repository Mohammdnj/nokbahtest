"use client";

/**
 * Client-side PDF generation for vouchers/invoices.
 * Uses html2pdf.js which is html2canvas + jsPDF under the hood.
 * Captures the DOM element (Arabic + stamp + logo) and exports as A4 PDF.
 */

interface PdfOptions {
  filename: string;
  element: HTMLElement;
}

type Html2PdfChain = {
  set: (opts: Record<string, unknown>) => Html2PdfChain;
  from: (el: HTMLElement) => Html2PdfChain;
  save: () => Promise<void>;
};

export async function downloadVoucherPdf({ filename, element }: PdfOptions) {
  const mod = await import("html2pdf.js");
  const html2pdf = (mod as unknown as { default?: () => Html2PdfChain }).default
    ?? (mod as unknown as () => Html2PdfChain);

  return html2pdf()
    .set({
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
}
