"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { IconPlus, IconReceipt2, IconCalendar, IconDownload } from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Invoice {
  id: number;
  invoice_number: string;
  doc_type: "receipt_voucher" | "disbursement_voucher" | "tax_invoice" | "simple_receipt";
  recipient_name: string;
  recipient_phone: string | null;
  total_amount: number;
  issued_at: string;
  status: string;
  issuer_name: string | null;
}

const docTypeLabels: Record<string, string> = {
  receipt_voucher: "سند قبض",
  disbursement_voucher: "سند صرف",
  tax_invoice: "فاتورة ضريبية",
  simple_receipt: "إيصال",
};

const filters = [
  { value: "", label: "الكل" },
  { value: "receipt_voucher", label: "سند قبض" },
  { value: "disbursement_voucher", label: "سند صرف" },
  { value: "tax_invoice", label: "فاتورة ضريبية" },
  { value: "simple_receipt", label: "إيصال" },
];

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get(`invoices?action=list${type ? `&type=${type}` : ""}`)
      .then((r) => setItems(r.data ?? r ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <AdminShell title="الفواتير والسندات">
      <div className="mx-auto max-w-5xl p-5 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">الفواتير والسندات</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              إدارة سندات القبض والصرف والفواتير
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/invoices/new/")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f]"
          >
            <IconPlus className="size-4" />
            إنشاء جديد
          </button>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all md:text-sm",
                type === f.value
                  ? "bg-[#0b7a5a] text-white shadow-md shadow-[#0b7a5a]/20"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
            <IconReceipt2 className="mx-auto size-10 text-neutral-300" />
            <p className="mt-3 text-neutral-500 dark:text-neutral-400">لم يتم إنشاء فواتير بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((inv, idx) => (
              <InvoiceRow key={inv.id} invoice={inv} delay={idx * 0.03} />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function InvoiceRow({ invoice, delay }: { invoice: Invoice; delay: number }) {
  const router = useRouter();
  const date = new Date(invoice.issued_at).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => router.push(`/admin/invoices/view/?id=${invoice.id}`)}
      className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-5 dark:bg-neutral-900"
    >
      <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b7a5a]/10 to-emerald-500/10 text-[#0b7a5a] dark:text-emerald-400">
        <IconReceipt2 className="size-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-neutral-900 md:text-base dark:text-white">
            {invoice.recipient_name}
          </h3>
          <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
            {docTypeLabels[invoice.doc_type]}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-neutral-500 md:text-xs dark:text-neutral-400">
          <span dir="ltr" className="font-mono">
            {invoice.invoice_number}
          </span>
          <span className="flex items-center gap-1">
            <IconCalendar className="size-3" />
            {date}
          </span>
        </div>
      </div>

      <div className="text-left">
        <p className="text-[10px] text-neutral-400 md:text-xs">المبلغ</p>
        <p className="text-sm font-bold text-[#0b7a5a] md:text-base dark:text-emerald-400">
          {invoice.total_amount} ر.س
        </p>
      </div>
      <IconDownload className="size-4 text-neutral-300" />
    </motion.button>
  );
}
