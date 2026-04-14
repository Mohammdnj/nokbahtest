"use client";
import React, { useState, useEffect } from "react";
import { useContract } from "@/context/ContractContext";
import { step6Schema } from "@/lib/contract-schema";
import { IconCurrencyDollar } from "@tabler/icons-react";
import FormCard from "../FormCard";
import Dropdown from "../ui/Dropdown";
import TextField from "../ui/TextField";
import DateField from "../ui/DateField";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";
import { api } from "@/lib/api";

interface Props {
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

interface DurationOption {
  value: number;
  label: string;
  price: number;
}

export default function Step6Financial({ onBack, onSubmit }: Props) {
  const { data, updateData, saveStep, isLoading } = useContract();
  const [durations, setDurations] = useState<DurationOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("lookups/duration-pricing")
      .then((res) => setDurations(res.data ?? res))
      .catch(() => {});
  }, []);

  // Pre-check terms
  useEffect(() => {
    if (data.agreed_terms === undefined) {
      updateData({ agreed_terms: true });
    }
  }, [data.agreed_terms, updateData]);

  const handleChange = (field: string, value: string | number | boolean) => {
    updateData({ [field]: value });
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleSubmit = async () => {
    const parsed = step6Schema.safeParse({
      ...data,
      agreed_terms: data.agreed_terms === true || (data.agreed_terms as unknown as number) === 1,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await saveStep(6, parsed.data);
      await onSubmit();
    } catch {
      // error handled in ctx
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDuration = durations.find((d) => d.value === Number(data.contract_duration_years));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormCard title="البيانات المالية">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <DateField
          label="تاريخ بداية العقد"
          required
          min={today}
          value={data.contract_start_date || ""}
          onChange={(v) => handleChange("contract_start_date", v)}
          error={errors.contract_start_date}
        />
        <Dropdown
          label="مدة العقد"
          required
          options={durations.map((d) => ({
            value: d.value,
            label: `${d.label} (${d.price} ر.س)`,
          }))}
          value={data.contract_duration_years}
          onChange={(v) => handleChange("contract_duration_years", Number(v))}
          error={errors.contract_duration_years}
        />
        <TextField
          label="قيمة الإيجار السنوي (ر.س)"
          required
          placeholder="0"
          type="number"
          inputMode="decimal"
          value={data.annual_rent_amount?.toString() || ""}
          onChange={(v) => handleChange("annual_rent_amount", v as unknown as number)}
          error={errors.annual_rent_amount}
          icon={<IconCurrencyDollar className="size-5" />}
        />
        <Dropdown
          label="طريقة السداد"
          required
          options={[
            { value: "monthly", label: "شهري" },
            { value: "quarterly", label: "ربع سنوي (4 دفعات)" },
            { value: "semi_annual", label: "نصف سنوي (دفعتين)" },
            { value: "annual", label: "سنوي (دفعة واحدة)" },
          ]}
          value={data.payment_method}
          onChange={(v) => handleChange("payment_method", v)}
          error={errors.payment_method}
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
          شروط إضافية
        </label>
        <textarea
          value={data.additional_conditions || ""}
          onChange={(e) => handleChange("additional_conditions", e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          placeholder="أضف أي شروط خاصة بالعقد (اختياري)"
        />
      </div>

      {selectedDuration && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              إجمالي رسوم التوثيق
            </span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {selectedDuration.price} ر.س
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          id="agree_terms"
          checked={!!data.agreed_terms}
          onChange={(e) => handleChange("agreed_terms", e.target.checked)}
          className="mt-0.5 size-5 flex-shrink-0 rounded border-neutral-300 accent-[#0b7a5a]"
        />
        <label htmlFor="agree_terms" className="text-sm text-neutral-600 dark:text-neutral-400">
          من خلال إنشاء الحساب، فإنك توافق على{" "}
          <a href="/terms" target="_blank" className="font-bold text-[#0b7a5a] hover:underline">
            الشروط والأحكام
          </a>{" "}
          الخاصة بنا
        </label>
      </div>
      {errors.agreed_terms && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.agreed_terms}</p>
      )}

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <SecondaryButton label="عودة" onClick={onBack} />
        <PrimaryButton
          label="إنشاء العقد"
          onClick={handleSubmit}
          loading={isLoading || submitting}
        />
      </div>
    </FormCard>
  );
}
