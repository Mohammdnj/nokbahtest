"use client";
import React, { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string | number | null | undefined;
  onChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function Dropdown({
  label,
  placeholder = "اختر",
  options,
  value,
  onChange,
  error,
  disabled,
  required,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3.5 text-right text-sm transition-all dark:bg-neutral-900",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-neutral-200 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-800",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <IconChevronDown className={cn("size-5 text-neutral-400 transition-transform", open && "rotate-180")} />
        <span className={selected ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400"}>
          {selected ? selected.label : placeholder}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-right text-sm transition-colors",
                    isSelected
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                      isSelected
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-neutral-300 dark:border-neutral-600"
                    )}
                  >
                    {isSelected && <IconCheck className="size-3 text-white" />}
                  </div>
                  <span className="flex-1">{opt.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
