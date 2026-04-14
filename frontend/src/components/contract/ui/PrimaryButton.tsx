"use client";
import React from "react";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  showArrow?: boolean;
}

export default function PrimaryButton({
  label,
  onClick,
  disabled,
  loading,
  type = "button",
  showArrow = true,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-all active:scale-[0.98] sm:w-auto md:min-w-[180px]",
        disabled || loading
          ? "cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600"
          : "bg-[#0b7a5a] text-white shadow-lg shadow-[#0b7a5a]/20 hover:bg-[#0a6b4f]"
      )}
    >
      {loading ? (
        <IconLoader2 className="size-5 animate-spin" />
      ) : (
        <>
          {label}
          {showArrow && <IconArrowLeft className="size-4" />}
        </>
      )}
    </button>
  );
}
