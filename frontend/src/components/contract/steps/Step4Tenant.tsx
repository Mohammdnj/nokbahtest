"use client";
import React, { useState } from "react";
import { useContract } from "@/context/ContractContext";
import { step4Schema } from "@/lib/contract-schema";
import { IconBuilding, IconFileText } from "@tabler/icons-react";
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

export default function Step4Tenant({ onNext, onBack }: Props) {
  const { data, updateData, saveStep, isLoading } = useContract();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number | boolean) => {
    updateData({ [field]: value });
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const tenantType = data.tenant_type || "individual";

  const handleNext = async () => {
    const parsed = step4Schema.safeParse({ ...data, tenant_type: tenantType });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    try {
      await saveStep(4, parsed.data);
      onNext();
    } catch {}
  };

  return (
    <FormCard title="معلومات المستأجر">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Dropdown
          label="نوع المستأجر"
          required
          options={[
            { value: "individual", label: "فرد" },
            { value: "establishment", label: "مؤسسة" },
            { value: "company", label: "شركة" },
          ]}
          value={tenantType}
          onChange={(v) => handleChange("tenant_type", v)}
        />
        <PhoneField
          label="رقم الجوال"
          required
          value={data.tenant_phone || ""}
          onChange={(v) => handleChange("tenant_phone", v)}
          error={errors.tenant_phone}
        />

        {tenantType === "individual" ? (
          <>
            <NationalIdField
              label="رقم الهوية"
              required
              value={data.tenant_id_number || ""}
              onChange={(v) => handleChange("tenant_id_number", v)}
              error={errors.tenant_id_number}
            />
            <DateField
              label="تاريخ الميلاد"
              required
              value={data.tenant_dob || ""}
              onChange={(v) => handleChange("tenant_dob", v)}
              error={errors.tenant_dob}
            />
          </>
        ) : (
          <>
            <TextField
              label="اسم المنشأة / الشركة"
              required
              value={data.company_name || ""}
              onChange={(v) => handleChange("company_name", v)}
              error={errors.company_name}
              icon={<IconBuilding className="size-5" />}
            />
            <TextField
              label="رقم السجل التجاري"
              required
              value={data.commercial_register || ""}
              onChange={(v) => handleChange("commercial_register", v)}
              error={errors.commercial_register}
              icon={<IconFileText className="size-5" />}
              inputMode="numeric"
            />
            <TextField
              label="الرقم الضريبي"
              value={data.vat_number || ""}
              onChange={(v) => handleChange("vat_number", v)}
              error={errors.vat_number}
              inputMode="numeric"
            />
          </>
        )}
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <SecondaryButton label="عودة" onClick={onBack} />
        <PrimaryButton label="التالي" onClick={handleNext} loading={isLoading} />
      </div>
    </FormCard>
  );
}
