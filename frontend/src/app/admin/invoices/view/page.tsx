"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  IconArrowRight,
  IconDownload,
  IconLoader2,
  IconPrinter,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import VoucherTemplate, { type VoucherData } from "@/components/invoice/VoucherTemplate";
import { downloadVoucherPdf } from "@/lib/generate-pdf";
import { api } from "@/lib/api";

const docTypeLabels: Record<string, string> = {
  receipt_voucher: "سند قبض",
  disbursement_voucher: "سند صرف",
  tax_invoice: "فاتورة ضريبية",
  simple_receipt: "إيصال استلام",
};

interface ApiInvoice {
  id: number;
  invoice_number: string;
  doc_type: VoucherData["docType"];
  recipient_name: string;
  recipient_id_number: string | null;
  recipient_phone: string | null;
  payment_method: string;
  payment_reference: string | null;
  subtotal: number | string;
  vat_rate: number | string;
  vat_amount: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  line_items: Array<{ description: string; qty: number; price: number }>;
  description: string | null;
  notes: string | null;
  status: string;
  issued_at: string;
  issuer_name: string | null;
}

export default function InvoiceViewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InvoiceViewInner />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <AdminShell title="عرض الفاتورة">
      <div className="mx-auto flex max-w-3xl items-center justify-center p-12">
        <IconLoader2 className="size-8 animate-spin text-[#0b7a5a]" />
      </div>
    </AdminShell>
  );
}

function InvoiceViewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const [invoice, setInvoice] = useState<ApiInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      setError("معرّف الفاتورة مفقود");
      setLoading(false);
      return;
    }
    api.get(`invoices?action=get&id=${id}`)
      .then((r) => {
        const body = r.data ?? r;
        setInvoice(body);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "فشل التحميل"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!printRef.current || !invoice) return;
    setDownloading(true);
    try {
      // Make sure the off-screen element is rendered before capturing
      await new Promise((r) => setTimeout(r, 100));
      await downloadVoucherPdf({
        filename: `${invoice.invoice_number}.pdf`,
        element: printRef.current,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    if (!invoice) return;
    navigator.clipboard.writeText(invoice.invoice_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingFallback />;

  if (error || !invoice) {
    return (
      <AdminShell title="عرض الفاتورة">
        <div className="mx-auto max-w-2xl p-5 md:p-8">
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
            <p className="text-red-600">{error || "لم يتم العثور على الفاتورة"}</p>
            <button
              onClick={() => router.push("/admin/invoices/")}
              className="mt-4 rounded-2xl bg-[#0b7a5a] px-5 py-3 text-sm font-bold text-white"
            >
              العودة للقائمة
            </button>
          </div>
        </div>
      </AdminShell>
    );
  }

  // Convert API row to VoucherData (numeric coercion)
  const voucherData: VoucherData = {
    docType: invoice.doc_type,
    invoiceNumber: invoice.invoice_number,
    issuedAt: invoice.issued_at,
    recipientName: invoice.recipient_name,
    recipientIdNumber: invoice.recipient_id_number ?? undefined,
    recipientPhone: invoice.recipient_phone ?? undefined,
    paymentMethod: invoice.payment_method,
    paymentReference: invoice.payment_reference ?? undefined,
    lineItems: (invoice.line_items || []).map((it) => ({
      description: it.description,
      qty: Number(it.qty) || 0,
      price: Number(it.price) || 0,
    })),
    vatRate: Number(invoice.vat_rate) || 0,
    discountAmount: Number(invoice.discount_amount) || 0,
    description: invoice.description ?? undefined,
    notes: invoice.notes ?? undefined,
    issuedByName: invoice.issuer_name ?? undefined,
  };

  return (
    <AdminShell title="عرض الفاتورة">
      <div className="mx-auto max-w-4xl p-5 md:p-8">
        <button
          onClick={() => router.push("/admin/invoices/")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-[#0b7a5a] dark:text-neutral-400"
        >
          <IconArrowRight className="size-4" />
          العودة للقائمة
        </button>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b7a5a] via-emerald-700 to-emerald-900 p-6 md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 text-white">
            <div>
              <div className="text-xs opacity-80">{docTypeLabels[invoice.doc_type]}</div>
              <h1
                className="mt-1 text-2xl font-bold md:text-3xl"
                dir="ltr"
                style={{ direction: "ltr", textAlign: "right" }}
              >
                {invoice.invoice_number}
              </h1>
              <div className="mt-2 text-xs opacity-80">
                {invoice.recipient_name} • {invoice.issued_at}
              </div>
            </div>
            <div className="text-left">
              <div className="text-xs opacity-80">المبلغ الإجمالي</div>
              <div className="text-3xl font-bold md:text-4xl">
                {Number(invoice.total_amount).toFixed(2)}
                <span className="mr-1 text-base font-medium">ر.س</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action bar */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] py-4 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 disabled:opacity-60"
          >
            {downloading ? <IconLoader2 className="size-5 animate-spin" /> : <IconDownload className="size-5" />}
            {downloading ? "جاري إنشاء PDF..." : "تحميل PDF"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#0b7a5a] py-4 text-sm font-bold text-[#0b7a5a]"
          >
            <IconPrinter className="size-5" />
            طباعة
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-neutral-200 px-6 py-4 text-sm font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            {copied ? <IconCheck className="size-5 text-emerald-600" /> : <IconCopy className="size-5" />}
            {copied ? "تم النسخ" : "نسخ الرقم"}
          </button>
        </div>

        {/* Visible scaled preview for the user */}
        <div className="overflow-hidden rounded-3xl bg-neutral-100 p-2 shadow-inner dark:bg-neutral-950">
          <div
            className="mx-auto origin-top"
            style={{
              transform: "scale(0.42)",
              transformOrigin: "top center",
              width: "794px",
              height: `${1123 * 0.42 + 40}px`,
            }}
          >
            <VoucherTemplate data={voucherData} />
          </div>
        </div>
      </div>

      {/* Hidden full-size copy for PDF capture */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: -99999,
          pointerEvents: "none",
          opacity: 0,
        }}
        aria-hidden
      >
        <VoucherTemplate ref={printRef} data={voucherData} />
      </div>
    </AdminShell>
  );
}
