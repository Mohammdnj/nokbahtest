"use client";
import React from "react";
import { IconId } from "@tabler/icons-react";
import TextField from "./TextField";

interface NationalIdFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}

export default function NationalIdField({ label, value, onChange, error, required }: NationalIdFieldProps) {
  return (
    <TextField
      label={label}
      placeholder="10 أرقام تبدأ بـ 1 أو 2"
      value={value}
      onChange={(v) => onChange(v.replace(/[^0-9]/g, "").slice(0, 10))}
      error={error}
      required={required}
      inputMode="numeric"
      maxLength={10}
      dir="ltr"
      icon={<IconId className="size-5" />}
    />
  );
}
