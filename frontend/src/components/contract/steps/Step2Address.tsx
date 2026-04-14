"use client";
import React, { useState, useEffect } from "react";
import { useContract } from "@/context/ContractContext";
import { step2Schema } from "@/lib/contract-schema";
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

interface Region {
  id: number;
  name_ar: string;
}

export default function Step2Address({ onNext, onBack }: Props) {
  const { data, updateData, saveStep, isLoading } = useContract();
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get("lookups/regions")
      .then((res) => setRegions(res.data ?? res))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!data.region) {
      setCities([]);
      return;
    }
    const region = regions.find((r) => r.name_ar === data.region);
    if (!region) return;
    api.get(`lookups/cities?region_id=${region.id}`)
      .then((res) => setCities(res.data ?? res))
      .catch(() => setCities([]));
  }, [data.region, regions]);

  const handleChange = (field: string, value: string | number) => {
    updateData({ [field]: value });
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleNext = async () => {
    const parsed = step2Schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    try {
      await saveStep(2, parsed.data);
      onNext();
    } catch {}
  };

  return (
    <FormCard title="العنوان الوطني للعقار">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Dropdown
          label="المنطقة"
          required
          options={regions.map((r) => ({ value: r.name_ar, label: r.name_ar }))}
          value={data.region}
          onChange={(v) => {
            handleChange("region", v);
            updateData({ city: "" });
          }}
          error={errors.region}
        />
        <Dropdown
          label="المدينة"
          required
          disabled={!data.region}
          options={cities.map((c) => ({ value: c.name_ar, label: c.name_ar }))}
          value={data.city}
          onChange={(v) => handleChange("city", v)}
          error={errors.city}
        />
        <TextField
          label="الحي"
          required
          placeholder="اسم الحي"
          value={data.district || ""}
          onChange={(v) => handleChange("district", v)}
          error={errors.district}
        />
        <TextField
          label="اسم الشارع"
          required
          placeholder="اسم الشارع"
          value={data.street_name || ""}
          onChange={(v) => handleChange("street_name", v)}
          error={errors.street_name}
        />
        <TextField
          label="رقم المبنى"
          required
          placeholder="0000"
          maxLength={4}
          dir="ltr"
          inputMode="numeric"
          value={data.building_number || ""}
          onChange={(v) => handleChange("building_number", v.replace(/[^0-9]/g, "").slice(0, 4))}
          error={errors.building_number}
        />
        <TextField
          label="الرمز البريدي"
          required
          placeholder="00000"
          maxLength={5}
          dir="ltr"
          inputMode="numeric"
          value={data.postal_code || ""}
          onChange={(v) => handleChange("postal_code", v.replace(/[^0-9]/g, "").slice(0, 5))}
          error={errors.postal_code}
        />
        <TextField
          label="الرقم الإضافي"
          required
          placeholder="0000"
          maxLength={4}
          dir="ltr"
          inputMode="numeric"
          value={data.additional_number || ""}
          onChange={(v) => handleChange("additional_number", v.replace(/[^0-9]/g, "").slice(0, 4))}
          error={errors.additional_number}
        />
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <SecondaryButton label="عودة" onClick={onBack} />
        <PrimaryButton label="التالي" onClick={handleNext} loading={isLoading} />
      </div>
    </FormCard>
  );
}
