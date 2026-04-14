"use client";
import React, { useState, useEffect } from "react";
import { IconAlertTriangle, IconBrandWhatsapp } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useContract } from "@/context/ContractContext";
import { step1Schema } from "@/lib/contract-schema";
import FormCard from "../FormCard";
import Dropdown from "../ui/Dropdown";
import TextField from "../ui/TextField";
import DateField from "../ui/DateField";
import PrimaryButton from "../ui/PrimaryButton";
import { api } from "@/lib/api";

interface Props {
  onNext: () => void;
}

export default function Step1Deed({ onNext }: Props) {
  const { data, updateData, saveStep, isLoading } = useContract();
  const [propertyTypes, setPropertyTypes] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get("lookups/property-types")
      .then((res) => setPropertyTypes(res.data ?? res))
      .catch(() => {});
  }, []);

  const handleChange = (field: string, value: string | number) => {
    updateData({ [field]: value });
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleNext = async () => {
    // Deceased owner blocks the flow entirely
    if (data.owner_alive === "deceased") return;

    const parsed = step1Schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    try {
      await saveStep(1, parsed.data);
      onNext();
    } catch {}
  };

  const isDeceased = data.owner_alive === "deceased";

  return (
    <FormCard title="بيانات الصك">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Dropdown
          label="المالك أو المستأجر"
          required
          options={[
            { value: "owner", label: "المالك" },
            { value: "tenant", label: "المستأجر" },
          ]}
          value={data.owner_or_tenant}
          onChange={(v) => handleChange("owner_or_tenant", v)}
          error={errors.owner_or_tenant}
        />
        <Dropdown
          label="هل المالك على قيد الحياة؟"
          required
          options={[
            { value: "alive", label: "نعم، حي يرزق بفضل الله" },
            { value: "deceased", label: "لا، متوفى يرحمه الله" },
          ]}
          value={data.owner_alive}
          onChange={(v) => handleChange("owner_alive", v)}
          error={errors.owner_alive}
        />
      </div>

      {/* Deceased warning — blocks the rest of the form and sends to WhatsApp */}
      {isDeceased && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/30"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              <IconAlertTriangle className="size-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900 md:text-base dark:text-amber-300">
                عقد متوفٍ يحتاج مراجعة يدوية
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-800 md:text-sm dark:text-amber-400">
                إذا كان المالك متوفى رحمه الله، لا نقدر نكمل العقد من خلال التطبيق.
                تواصل معنا عبر واتساب وفريقنا بيساعدك خطوة بخطوة.
              </p>

              <a
                href={`https://wa.me/966563214000?text=${encodeURIComponent(
                  "السلام عليكم، أبغى أوثّق عقد إيجار والمالك متوفى يرحمه الله. أحتاج مساعدة."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#25D366]/20 transition-all hover:bg-[#1fb957] active:scale-[0.98]"
              >
                <IconBrandWhatsapp className="size-4" />
                تواصل عبر واتساب
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rest of the form — hidden when deceased */}
      {!isDeceased && (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Dropdown
            label="نوع الصك"
            required
            options={[
              { value: "electronic", label: "صك إلكتروني" },
              { value: "real_estate_registry", label: "صك السجل العقاري" },
              { value: "paper", label: "صك ورقي" },
            ]}
            value={data.deed_type}
            onChange={(v) => handleChange("deed_type", v)}
            error={errors.deed_type}
          />
          <Dropdown
            label="نوع العقار"
            required
            options={propertyTypes}
            value={data.property_type}
            onChange={(v) => handleChange("property_type", v)}
            error={errors.property_type}
          />
          <Dropdown
            label="استخدام العقار"
            required
            options={[
              { value: "commercial", label: "تجاري" },
              { value: "residential_commercial", label: "سكني - تجاري" },
            ]}
            value={data.property_usage}
            onChange={(v) => handleChange("property_usage", v)}
            error={errors.property_usage}
          />
          <div />
          <TextField
            label="رقم الصك"
            placeholder="00"
            required
            value={data.deed_number || ""}
            onChange={(v) => handleChange("deed_number", v)}
            error={errors.deed_number}
          />
          <DateField
            label="تاريخ الصك"
            required
            value={data.deed_date || ""}
            onChange={(v) => handleChange("deed_date", v)}
            error={errors.deed_date}
          />
        </div>
      )}

      {!isDeceased && (
        <div className="mt-10 flex justify-start">
          <PrimaryButton label="التالي" onClick={handleNext} loading={isLoading} />
        </div>
      )}
    </FormCard>
  );
}
