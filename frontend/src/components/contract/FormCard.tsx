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
        "mx-auto w-full max-w-4xl rounded-3xl bg-white p-5 shadow-sm md:p-10 dark:bg-neutral-900",
        className
      )}
    >
      <h2 className="mb-6 text-right text-base font-bold text-neutral-800 md:mb-8 md:text-lg dark:text-neutral-200">
        {title}
      </h2>
      {children}
    </div>
  );
}
