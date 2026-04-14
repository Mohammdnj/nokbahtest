"use client";
import React, { useEffect, useRef } from "react";
import { IconCheck } from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Natural order — in an RTL flex row, the first item appears on the right.
const STEPS = [
  { num: 1, label: "الصك" },
  { num: 2, label: "العنوان" },
  { num: 3, label: "المالك" },
  { num: 4, label: "المستأجر" },
  { num: 5, label: "الوحدة" },
  { num: 6, label: "البيانات المالية" },
];

interface StepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep active step in view on mobile as the user advances
  useEffect(() => {
    if (!activeRef.current || !scrollerRef.current) return;
    activeRef.current.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentStep]);

  return (
    <div
      ref={scrollerRef}
      className="no-scrollbar mx-auto w-full max-w-4xl overflow-x-auto pb-2"
      dir="rtl"
    >
      <div className="flex min-w-max items-center justify-start gap-2 px-1 md:justify-center md:gap-3">
        {STEPS.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <button
              key={step.num}
              ref={isActive ? activeRef : null}
              type="button"
              onClick={() => isClickable && onStepClick?.(step.num)}
              disabled={!isClickable}
              className={cn(
                "group relative flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-semibold transition-all md:px-5 md:py-2.5 md:text-sm",
                isActive
                  ? "bg-[#0b7a5a] text-white shadow-md shadow-[#0b7a5a]/25"
                  : isCompleted
                  ? "cursor-pointer bg-[#0b7a5a]/10 text-[#0b7a5a] hover:bg-[#0b7a5a]/20 dark:bg-[#0b7a5a]/20"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
              )}
            >
              {isCompleted ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-[#0b7a5a] text-white md:size-5">
                  <IconCheck className="size-3" />
                </span>
              ) : (
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full text-[10px] md:size-5 md:text-[11px]",
                    isActive ? "bg-white/25 text-white" : "bg-white text-neutral-400 dark:bg-neutral-700"
                  )}
                >
                  {step.num}
                </span>
              )}
              <span>{step.label}</span>
              {isActive && (
                <motion.span
                  layoutId="stepper-underline"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  className="absolute inset-0 -z-10 rounded-full ring-2 ring-[#0b7a5a]/25"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
