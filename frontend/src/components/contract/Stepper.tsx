"use client";
import React from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 6, label: "البيانات المالية" },
  { num: 5, label: "الوحدة" },
  { num: 4, label: "المستأجر" },
  { num: 3, label: "المالك" },
  { num: 2, label: "العنوان" },
  { num: 1, label: "الصك" },
];

interface StepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-x-auto pb-2" dir="rtl">
      <div className="flex items-center justify-start gap-2 md:justify-center md:gap-3">
        {STEPS.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => isClickable && onStepClick?.(step.num)}
              disabled={!isClickable}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all md:px-5 md:py-2.5 md:text-sm",
                isActive
                  ? "bg-[#0b7a5a] text-white shadow-md shadow-[#0b7a5a]/25"
                  : isCompleted
                  ? "cursor-pointer bg-[#0b7a5a]/10 text-[#0b7a5a] hover:bg-[#0b7a5a]/20 dark:bg-[#0b7a5a]/20"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
              )}
            >
              {step.num}. {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
