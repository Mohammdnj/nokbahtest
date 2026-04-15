"use client";

/**
 * Client-side PDF generation for vouchers/invoices.
 *
 * html2canvas (used by html2pdf.js) cannot parse modern CSS color functions
 * like oklch() / lab() / lch() — and our Tailwind 4 + shadcn setup uses
 * oklch() everywhere. So we clone the source element into an isolated
 * container appended directly to <body>, strip any class attributes that
 * could pull in oklch tokens, and then capture the clone instead of the
 * original (which lives inside the AdminShell tree with its dark-mode vars).
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
  const html2pdf =
    (mod as unknown as { default?: () => Html2PdfChain }).default ??
    (mod as unknown as () => Html2PdfChain);

  // Build an isolated wrapper with hardcoded RGB/hex values for every CSS var
  // that Tailwind 4 normally fills with oklch(). This breaks inheritance.
  const wrapper = document.createElement("div");
  wrapper.style.cssText = [
    "position: fixed",
    "top: 0",
    "left: 0",
    "width: 794px",
    "background: #ffffff",
    "color: #1f2937",
    "z-index: -1",
    "pointer-events: none",
    "isolation: isolate",
    "--background: #ffffff",
    "--foreground: #1f2937",
    "--card: #ffffff",
    "--card-foreground: #1f2937",
    "--popover: #ffffff",
    "--popover-foreground: #1f2937",
    "--primary: #0b7a5a",
    "--primary-foreground: #ffffff",
    "--secondary: #f3f4f6",
    "--secondary-foreground: #1f2937",
    "--muted: #f3f4f6",
    "--muted-foreground: #6b7280",
    "--accent: #f3f4f6",
    "--accent-foreground: #1f2937",
    "--destructive: #ef4444",
    "--border: #e5e7eb",
    "--input: #e5e7eb",
    "--ring: #0b7a5a",
  ].join(";");

  // Deep-clone the template so the original stays untouched
  const clone = element.cloneNode(true) as HTMLElement;
  // Remove every class attribute so html2canvas only sees inline styles
  clone.removeAttribute("class");
  clone.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // Wait for layout + image loading
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await waitForImages(wrapper);

    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#ffffff",
          logging: false,
          foreignObjectRendering: false,
          ignoreElements: (el: Element) => {
            const tag = el.tagName?.toLowerCase();
            return tag === "script" || tag === "style" || tag === "link";
          },
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(clone)
      .save();
  } finally {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }
}

async function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
}
