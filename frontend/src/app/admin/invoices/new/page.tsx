"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  IconPlus,
  IconTrash,
  IconLoader2,
  IconReceipt2,
  IconCashRegister,
  IconFileInvoice,
  IconFileText,
  IconDownload,
  IconDeviceFloppy,
  IconArrowRight,
} from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import VoucherTemplate, { computeTotals, type LineItem, type VoucherData } from "@/components/invoice/VoucherTemplate";
import { downloadVoucherPdf } from "@/lib/generate-pdf";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const docTypes = [
  { value: "receipt_voucher" as const, label: "سند قبض", Icon: IconReceipt2, desc: "استلام مبلغ من عميل" },
  { value: "disbursement_voucher" as const, label: "سند صرف", Icon: IconCashRegister, desc: "صرف مبلغ لجهة" },
  { value: "tax_invoice" as const, label: "فاتورة ضريبية", Icon: IconFileInvoice, desc: "فاتورة ضريبية شاملة" },
  { value: "simple_receipt" as const, label: "إيصال", Icon: IconFileText, desc: "إيصال استلام بسيط" },
];

const paymentMethods = [
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "cash", label: "نقداً" },
  { value: "mada", label: "مدى" },
  { value: "credit_card", label: "بطاقة ائتمان" },
  { value: "stc_pay", label: "STC Pay" },
  { value: "other", label: "أخرى" },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [docType, setDocType] = useState<VoucherData["docType"]>("receipt_voucher");
  const [recipientName, setRecipientName] = useState("");
  const [recipientIdNumber, setRecipientIdNumber] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [vatRate, setVatRate] = useState(15);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", qty: 1, price: 0 }]);

  const [savedNumber, setSavedNumber] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  const updateItem = (idx: number, patch: Partial<LineItem>) => {
    setLineItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () => setLineItems((list) => [...list, { description: "", qty: 1, price: 0 }]);

  const removeItem = (idx: number) => {
    setLineItems((list) => (list.length > 1 ? list.filter((_, i) => i !== idx) : list));
  };

  const { subtotal, vatAmount, total } = computeTotals(lineItems, vatRate, discountAmount);

  const voucherData: VoucherData = {
    docType,
    invoiceNumber: savedNumber ?? "—",
    issuedAt,
    recipientName: recipientName || "—",
    recipientIdNumber,
    recipientPhone,
    paymentMethod,
    paymentReference,
    lineItems,
    vatRate,
    discountAmount,
    description,
    notes,
    issuedByName: user?.name,
  };

  const handleSave = async () => {
    setError("");
    if (!recipientName) return setError("اسم المستلم مطلوب");
    if (lineItems.every((i) => !i.description)) return setError("يجب إضافة بند واحد على الأقل");

    setSaving(true);
    try {
      const res = await api.post("invoices?action=create", {
        doc_type: docType,
        recipient_name: recipientName,
        recipient_id_number: recipientIdNumber || null,
        recipient_phone: recipientPhone || null,
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        line_items: lineItems,
        vat_rate: vatRate,
        discount_amount: discountAmount,
        description: description || null,
        notes: notes || null,
        issued_at: issuedAt,
        status: "issued",
      });
      const body = res.data ?? res;
      setSavedNumber(body.invoice_number);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!savedNumber) {
      setError("احفظ أولاً قبل تحميل PDF");
      return;
    }
    if (!printRef.current) return;
    setDownloading(true);
    try {
      await downloadVoucherPdf({
        filename: `${savedNumber}.pdf`,
        element: printRef.current,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminShell title="إنشاء فاتورة / سند">
      <div className="mx-auto max-w-5xl p-5 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
            إنشاء مستند جديد
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            اختر النوع، املأ البيانات، واحفظ ثم حمّل PDF
          </p>
        </div>

        {/* Doc type picker */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {docTypes.map((dt) => {
            const active = docType === dt.value;
            const Icon = dt.Icon;
            return (
              <button
                key={dt.value}
                onClick={() => setDocType(dt.value)}
                className={cn(
                  "relative rounded-2xl border-2 p-4 text-right transition-all active:scale-[0.98]",
                  active
                    ? "border-[#0b7a5a] bg-emerald-50 shadow-lg shadow-[#0b7a5a]/10 dark:bg-emerald-950/30"
                    : "border-neutral-200 bg-white hover:border-[#0b7a5a]/40 dark:border-neutral-800 dark:bg-neutral-900"
                )}
              >
                <div
                  className={cn(
                    "mb-2 flex size-10 items-center justify-center rounded-xl",
                    active
                      ? "bg-[#0b7a5a] text-white"
                      : "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-bold text-neutral-800 dark:text-white">{dt.label}</p>
                <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">{dt.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white p-5 shadow-sm md:p-8 dark:bg-neutral-900">
          <h2 className="mb-4 text-base font-bold md:text-lg">بيانات المستلم</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField label="اسم المستلم *" value={recipientName} onChange={setRecipientName} />
            <InputField label="رقم الهوية" value={recipientIdNumber} onChange={setRecipientIdNumber} ltr />
            <InputField label="الجوال" value={recipientPhone} onChange={setRecipientPhone} ltr />
            <InputField label="تاريخ الإصدار *" type="date" value={issuedAt} onChange={setIssuedAt} />
          </div>

          <h2 className="mb-4 mt-8 text-base font-bold md:text-lg">طريقة الدفع</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              label="طريقة الدفع"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={paymentMethods}
            />
            <InputField
              label="مرجع العملية"
              value={paymentReference}
              onChange={setPaymentReference}
              ltr
              placeholder="رقم التحويل / العملية"
            />
          </div>

          <h2 className="mb-4 mt-8 flex items-center justify-between text-base font-bold md:text-lg">
            <span>البنود</span>
            <button
              onClick={addItem}
              className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#0b7a5a] hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <IconPlus className="size-3.5" />
              إضافة بند
            </button>
          </h2>
          <div className="space-y-3">
            {lineItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_80px_100px_auto] gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50"
              >
                <input
                  placeholder="وصف البند"
                  value={item.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  type="number"
                  placeholder="كمية"
                  value={item.qty}
                  onChange={(e) => updateItem(idx, { qty: parseFloat(e.target.value) || 0 })}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-center text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  type="number"
                  placeholder="السعر"
                  value={item.price}
                  onChange={(e) => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-center text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-700 dark:bg-neutral-900"
                />
                <button
                  onClick={() => removeItem(idx)}
                  className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                >
                  <IconTrash className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <h2 className="mb-4 mt-8 text-base font-bold md:text-lg">الإجماليات</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="ضريبة القيمة المضافة %"
              type="number"
              value={String(vatRate)}
              onChange={(v) => setVatRate(parseFloat(v) || 0)}
            />
            <InputField
              label="قيمة الخصم (ر.س)"
              type="number"
              value={String(discountAmount)}
              onChange={(v) => setDiscountAmount(parseFloat(v) || 0)}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
            <Row label="المجموع الفرعي" value={`${subtotal.toFixed(2)} ر.س`} />
            {discountAmount > 0 && <Row label="الخصم" value={`- ${discountAmount.toFixed(2)} ر.س`} />}
            {vatRate > 0 && <Row label={`ضريبة ${vatRate}%`} value={`${vatAmount.toFixed(2)} ر.س`} />}
            <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-2 text-base font-bold text-[#0b7a5a] dark:border-neutral-700 dark:text-emerald-400">
              <span>الإجمالي</span>
              <span>{total.toFixed(2)} ر.س</span>
            </div>
          </div>

          <h2 className="mb-4 mt-8 text-base font-bold md:text-lg">معلومات إضافية</h2>
          <div className="space-y-4">
            <TextAreaField label="الوصف" value={description} onChange={setDescription} rows={2} />
            <TextAreaField label="ملاحظات" value={notes} onChange={setNotes} rows={3} />
          </div>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-24 z-20 mt-6 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-xl sm:flex-row md:bottom-6 dark:bg-neutral-900">
          {!savedNumber ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] py-4 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/25 disabled:opacity-60"
            >
              {saving ? <IconLoader2 className="size-5 animate-spin" /> : <IconDeviceFloppy className="size-5" />}
              {saving ? "جاري الحفظ..." : "حفظ المستند"}
            </button>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-4 text-sm font-bold text-[#0b7a5a] dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                تم الحفظ: <span dir="ltr">{savedNumber}</span>
              </motion.div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] py-4 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/25 disabled:opacity-60"
              >
                {downloading ? <IconLoader2 className="size-5 animate-spin" /> : <IconDownload className="size-5" />}
                {downloading ? "جاري التحميل..." : "تحميل PDF"}
              </button>
              <button
                onClick={() => router.push("/admin/invoices/")}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#0b7a5a] py-4 text-sm font-bold text-[#0b7a5a] sm:px-6"
              >
                <IconArrowRight className="size-4" />
                عودة
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden template for PDF capture — positioned far off-screen */}
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

function InputField({
  label,
  value,
  onChange,
  type = "text",
  ltr,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  ltr?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-neutral-700 dark:text-neutral-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={ltr ? "ltr" : undefined}
        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-neutral-700 dark:text-neutral-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-neutral-700 dark:text-neutral-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
