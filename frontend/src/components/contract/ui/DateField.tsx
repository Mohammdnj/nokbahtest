"use client";
import React from "react";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
}

export default function DateField({ label, value, onChange, error, required, min, max }: DateFieldProps) {
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
            ? "border-red-300 focus-within:border-red-500"
            : "border-neutral-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-neutral-800"
        )}
      >
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-neutral-400 dark:text-white"
        />
        <span className="px-3 text-neutral-400">
          <IconCalendar className="size-5" />
        </span>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
