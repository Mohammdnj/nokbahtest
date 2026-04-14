"use client";
import React from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SecondaryButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function SecondaryButton({ label, onClick, disabled }: SecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full border-2 border-[#0b7a5a] bg-white px-8 py-3.5 text-sm font-bold text-[#0b7a5a] transition-all active:scale-[0.98] md:min-w-[180px] dark:bg-neutral-900",
        "hover:bg-[#0b7a5a]/5",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <IconArrowRight className="size-4" />
      {label}
    </button>
  );
}
