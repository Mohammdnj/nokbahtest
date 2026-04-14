"use client";
import React, { useState, useEffect } from "react";
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

      <div className="mt-10 flex justify-start">
        <PrimaryButton label="التالي" onClick={handleNext} loading={isLoading} />
      </div>
    </FormCard>
  );
}
