"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormCard({ title, children, className }: FormCardProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-4xl rounded-3xl border border-neutral-200/50 bg-white p-5 shadow-[0_4px_30px_-8px_rgba(0,0,0,0.06)] md:p-10 dark:border-neutral-800/50 dark:bg-neutral-900",
        className
      )}
    >
      <h2 className="mb-5 text-right text-base font-bold text-neutral-800 md:mb-8 md:text-lg dark:text-neutral-200">
        {title}
      </h2>
      {children}
    </div>
  );
}
