"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IconPlus, IconDiscount2, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Discount {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  applies_to: "all" | "residential" | "commercial";
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: number;
  notes: string | null;
}

export default function AdminDiscountsPage() {
  const [items, setItems] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("admin?action=discounts")
      .then((r) => setItems(r.data ?? r ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    if (!confirm("حذف الكود؟")) return;
    await api.delete(`admin?action=delete-discount&id=${id}`);
    setItems((list) => list.filter((i) => i.id !== id));
  };

  return (
    <AdminShell title="أكواد الخصم">
      <div className="mx-auto max-w-5xl p-5 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">أكواد الخصم</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              إدارة كوبونات الخصم النشطة
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f]"
          >
            <IconPlus className="size-4" />
            كود جديد
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
            <IconDiscount2 className="mx-auto size-10 text-neutral-300" />
            <p className="mt-3 text-neutral-500 dark:text-neutral-400">لا توجد أكواد خصم بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((d, idx) => (
              <DiscountCard key={d.id} discount={d} delay={idx * 0.05} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <NewDiscountForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </AdminShell>
  );
}

function DiscountCard({
  discount,
  delay,
  onDelete,
}: {
  discount: Discount;
  delay: number;
  onDelete: (id: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-neutral-400">الكود</div>
          <div dir="ltr" className="mt-0.5 text-xl font-bold tracking-wide text-[#0b7a5a] dark:text-emerald-400">
            {discount.code}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              discount.is_active
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
            )}
          >
            {discount.is_active ? <IconCheck className="size-3" /> : <IconX className="size-3" />}
            {discount.is_active ? "نشط" : "معطّل"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-neutral-900 dark:text-white">
          {discount.type === "percent" ? `${discount.value}%` : `${discount.value} ر.س`}
        </span>
        <span className="text-xs text-neutral-500">
          على {discount.applies_to === "all" ? "كل العقود" : discount.applies_to === "residential" ? "السكني" : "التجاري"}
        </span>
      </div>

      {discount.notes && (
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">{discount.notes}</p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-[10px] dark:border-neutral-800">
        <Stat label="الاستخدامات" value={`${discount.used_count} / ${discount.max_uses ?? "∞"}`} />
        <Stat label="ينتهي" value={discount.expires_at ?? "لا"} />
        <button
          onClick={() => onDelete(discount.id)}
          className="flex items-center justify-center gap-1 rounded-xl bg-red-50 px-2 py-1.5 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
        >
          <IconTrash className="size-3" />
          حذف
        </button>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-neutral-400">{label}</div>
      <div className="font-bold text-neutral-700 dark:text-neutral-300">{value}</div>
    </div>
  );
}

function NewDiscountForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [appliesTo, setAppliesTo] = useState<"all" | "residential" | "commercial">("all");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!code || !value) return setError("الكود والقيمة مطلوبان");
    setSaving(true);
    setError("");
    try {
      await api.post("admin?action=create-discount", {
        code,
        type,
        value: parseFloat(value),
        applies_to: appliesTo,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
        notes: notes || null,
      });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-x-0 bottom-0 top-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" dir="rtl">
        <div className="w-full max-w-lg rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8 dark:bg-neutral-900">
          <h2 className="mb-5 text-xl font-bold md:text-2xl">كود خصم جديد</h2>

          <div className="space-y-4">
            <Field label="الكود *">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SAVE20"
                dir="ltr"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 font-mono text-base outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="النوع *">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "percent" | "fixed")}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800"
                >
                  <option value="percent">نسبة مئوية %</option>
                  <option value="fixed">قيمة ثابتة ر.س</option>
                </select>
              </Field>
              <Field label="القيمة *">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="20"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800"
                />
              </Field>
            </div>

            <Field label="يطبّق على">
              <select
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value as typeof appliesTo)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800"
              >
                <option value="all">كل العقود</option>
                <option value="residential">السكني فقط</option>
                <option value="commercial">التجاري فقط</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="الحد الأقصى للاستخدامات">
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="لا محدود"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800"
                />
              </Field>
              <Field label="تاريخ الانتهاء">
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800"
                />
              </Field>
            </div>

            <Field label="ملاحظات">
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اختياري"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800"
              />
            </Field>

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-neutral-300 py-3 text-sm font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 rounded-2xl bg-[#0b7a5a] py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ الكود"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      {children}
    </div>
  );
}
