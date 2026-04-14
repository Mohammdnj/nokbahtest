"use client";
import React, { useState } from "react";
import { useContract } from "@/context/ContractContext";
import { step3Schema } from "@/lib/contract-schema";
import { IconUser } from "@tabler/icons-react";
import FormCard from "../FormCard";
import Dropdown from "../ui/Dropdown";
import TextField from "../ui/TextField";
import DateField from "../ui/DateField";
import PhoneField from "../ui/PhoneField";
import NationalIdField from "../ui/NationalIdField";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Owner({ onNext, onBack }: Props) {
  const { data, updateData, saveStep, isLoading } = useContract();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number | boolean) => {
    updateData({ [field]: value });
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleNext = async () => {
    const parsed = step3Schema.safeParse({
      ...data,
      has_agent: data.has_agent === true || (data.has_agent as unknown as number) === 1,
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
      await saveStep(3, parsed.data);
      onNext();
    } catch {}
  };

  return (
    <FormCard title="بيانات مالك العقار">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField
          label="اسم المالك"
          required
          placeholder="الاسم بالكامل"
          value={data.owner_name || ""}
          onChange={(v) => handleChange("owner_name", v)}
          error={errors.owner_name}
          icon={<IconUser className="size-5" />}
        />
        <NationalIdField
          label="رقم الهوية"
          required
          value={data.owner_id_number || ""}
          onChange={(v) => handleChange("owner_id_number", v)}
          error={errors.owner_id_number}
        />
        <DateField
          label="تاريخ الميلاد"
          required
          value={data.owner_dob || ""}
          onChange={(v) => handleChange("owner_dob", v)}
          error={errors.owner_dob}
        />
        <PhoneField
          label="رقم الجوال"
          required
          value={data.owner_phone || ""}
          onChange={(v) => handleChange("owner_phone", v)}
          error={errors.owner_phone}
        />
        <Dropdown
          label="هل تريد إضافة وكيل؟"
          options={[
            { value: "yes", label: "نعم" },
            { value: "no", label: "لا" },
          ]}
          value={data.has_agent ? "yes" : "no"}
          onChange={(v) => handleChange("has_agent", v === "yes")}
        />
      </div>

      {data.has_agent && (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-5 dark:border-neutral-700">
          <h3 className="mb-5 text-sm font-bold text-neutral-700 dark:text-neutral-300">بيانات الوكيل</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField
              label="اسم الوكيل"
              required
              value={data.agent_name || ""}
              onChange={(v) => handleChange("agent_name", v)}
              error={errors.agent_name}
              icon={<IconUser className="size-5" />}
            />
            <NationalIdField
              label="رقم هوية الوكيل"
              required
              value={data.agent_id_number || ""}
              onChange={(v) => handleChange("agent_id_number", v)}
              error={errors.agent_id_number}
            />
            <DateField
              label="تاريخ ميلاد الوكيل"
              required
              value={data.agent_dob || ""}
              onChange={(v) => handleChange("agent_dob", v)}
              error={errors.agent_dob}
            />
            <PhoneField
              label="جوال الوكيل"
              required
              value={data.agent_phone || ""}
              onChange={(v) => handleChange("agent_phone", v)}
              error={errors.agent_phone}
            />
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <SecondaryButton label="عودة" onClick={onBack} />
        <PrimaryButton label="التالي" onClick={handleNext} loading={isLoading} />
      </div>
    </FormCard>
  );
}
