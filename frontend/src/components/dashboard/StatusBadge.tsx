"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const statusMeta: Record<
  string,
  { label: string; classes: string }
> = {
  draft: {
    label: "مسودة",
    classes: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  },
  pending: {
    label: "قيد المراجعة",
    classes: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  in_progress: {
    label: "جاري التنفيذ",
    classes: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  reviewing: {
    label: "قيد المراجعة",
    classes: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  active: {
    label: "نشط",
    classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  completed: {
    label: "مكتمل",
    classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  rejected: {
    label: "مرفوض",
    classes: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  expired: {
    label: "منتهي",
    classes: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
  },
  cancelled: {
    label: "ملغي",
    classes: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? { label: status, classes: "bg-neutral-100 text-neutral-600" };
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold md:text-xs", meta.classes)}>
      {meta.label}
    </span>
  );
}
