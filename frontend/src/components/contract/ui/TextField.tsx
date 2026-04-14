"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  type?: "text" | "number" | "tel";
  maxLength?: number;
  dir?: "rtl" | "ltr";
  inputMode?: "text" | "numeric" | "decimal" | "tel";
  disabled?: boolean;
}

export default function TextField({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  icon,
  type = "text",
  maxLength,
  dir,
  inputMode,
  disabled,
}: TextFieldProps) {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={cn(
          "flex items-center rounded-2xl border bg-white transition-all dark:bg-neutral-900",
          error
            ? "border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
            : "border-neutral-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-neutral-800",
          disabled && "opacity-50"
        )}
      >
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          dir={dir}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
        />
        {icon && <span className="px-3 text-neutral-400">{icon}</span>}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
