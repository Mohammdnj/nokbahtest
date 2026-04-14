"use client";
import React, { useState, useEffect } from "react";
import { useContract } from "@/context/ContractContext";
import { step5Schema } from "@/lib/contract-schema";
import FormCard from "../FormCard";
import Dropdown from "../ui/Dropdown";
import TextField from "../ui/TextField";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";
import { api } from "@/lib/api";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function Step5Unit({ onNext, onBack }: Props) {
  const { data, updateData, saveStep, isLoading } = useContract();
  const [unitTypes, setUnitTypes] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get("lookups/unit-types")
      .then((res) => setUnitTypes(res.data ?? res))
      .catch(() => {});
  }, []);

  const handleChange = (field: string, value: string | number) => {
    updateData({ [field]: value });
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleNext = async () => {
    const parsed = step5Schema.safeParse({
      ...data,
      window_ac_count: data.window_ac_count ?? 0,
      split_ac_count: data.split_ac_count ?? 0,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    try {
      await saveStep(5, parsed.data);
      onNext();
    } catch {}
  };

  const unitNumbers = Array.from({ length: 50 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const floorOptions = [
    { value: "ground", label: "الدور الأرضي" },
    ...Array.from({ length: 20 }, (_, i) => ({
      value: String(i + 1),
      label: `الدور ${i + 1}`,
    })),
  ];

  const acOptions = Array.from({ length: 21 }, (_, i) => ({
    value: String(i),
    label: String(i),
  }));

  return (
    <FormCard title="بيانات الوحدة المؤجرة">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Dropdown
          label="نوع الوحدة"
          required
          options={unitTypes}
          value={data.unit_type}
          onChange={(v) => handleChange("unit_type", v)}
          error={errors.unit_type}
        />
        <Dropdown
          label="استخدام الوحدة"
          required
          options={[
            { value: "family", label: "سكن عائلات" },
            { value: "individual", label: "سكن أفراد" },
            { value: "collective", label: "السكن الجماعي" },
          ]}
          value={data.unit_usage}
          onChange={(v) => handleChange("unit_usage", v)}
          error={errors.unit_usage}
        />
        <Dropdown
          label="رقم الوحدة"
          required
          options={unitNumbers}
          value={data.unit_number}
          onChange={(v) => handleChange("unit_number", v)}
          error={errors.unit_number}
        />
        <Dropdown
          label="الدور"
          required
          options={floorOptions}
          value={data.floor_number}
          onChange={(v) => handleChange("floor_number", v)}
          error={errors.floor_number}
        />
        <TextField
          label="المساحة (م²)"
          required
          placeholder="0"
          type="number"
          inputMode="decimal"
          value={data.unit_area?.toString() || ""}
          onChange={(v) => handleChange("unit_area", v as unknown as number)}
          error={errors.unit_area}
        />
        <div />
        <Dropdown
          label="عدد مكيفات الشباك"
          options={acOptions}
          value={data.window_ac_count?.toString() ?? "0"}
          onChange={(v) => handleChange("window_ac_count", Number(v))}
          error={errors.window_ac_count}
        />
        <Dropdown
          label="عدد مكيفات السبليت"
          options={acOptions}
          value={data.split_ac_count?.toString() ?? "0"}
          onChange={(v) => handleChange("split_ac_count", Number(v))}
          error={errors.split_ac_count}
        />
        <TextField
          label="عداد الكهرباء (اختياري)"
          placeholder="رقم العداد"
          value={data.electricity_meter || ""}
          onChange={(v) => handleChange("electricity_meter", v)}
        />
        <TextField
          label="عداد الماء (اختياري)"
          placeholder="رقم العداد"
          value={data.water_meter || ""}
          onChange={(v) => handleChange("water_meter", v)}
        />
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <SecondaryButton label="عودة" onClick={onBack} />
        <PrimaryButton label="التالي" onClick={handleNext} loading={isLoading} />
      </div>
    </FormCard>
  );
}
