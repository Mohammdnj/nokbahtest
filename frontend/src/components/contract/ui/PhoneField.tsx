"use client";
import React from "react";
import { IconPhone } from "@tabler/icons-react";
import TextField from "./TextField";

interface PhoneFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}

export default function PhoneField({ label, value, onChange, error, required }: PhoneFieldProps) {
  return (
    <TextField
      label={label}
      placeholder="05xxxxxxxx"
      value={value}
      onChange={(v) => onChange(v.replace(/[^0-9]/g, "").slice(0, 10))}
      error={error}
      required={required}
      type="tel"
      inputMode="numeric"
      maxLength={10}
      dir="ltr"
      icon={<IconPhone className="size-5" />}
    />
  );
}
