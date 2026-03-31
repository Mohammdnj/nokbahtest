"use client";
import React from "react";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export default function Pricing() {
  return (
    <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between px-5 py-12 md:px-8 md:py-24" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          الباقات
        </span>
        <h2 className="text-center text-2xl font-bold text-neutral-800 md:text-4xl dark:text-white">
          أسعار واضحة بدون رسوم مخفية
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-neutral-600 md:text-lg dark:text-neutral-400">
          اختر نوع العقد المناسب لك وابدأ التوثيق فوراً
        </p>
      </motion.div>

      <div className="relative z-20 mx-auto mt-10 grid w-full max-w-3xl grid-cols-1 gap-5 md:mt-20 md:grid-cols-2 md:gap-6">
        {tiers.map((tier, idx) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.15 }}
            className={cn(
              "flex h-full flex-col justify-between rounded-2xl px-6 py-8",
              tier.featured
                ? "relative bg-[radial-gradient(164.75%_100%_at_50%_0%,#065f46_0%,#022c22_48.73%)] shadow-2xl shadow-emerald-500/10"
                : "border border-neutral-200/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-900/50",
            )}
          >
            <div>
              <h3
                className={cn(
                  "text-lg font-bold leading-7",
                  tier.featured ? "text-white" : "text-neutral-800 dark:text-neutral-200",
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-3">
                <span
                  className={cn(
                    "inline-block text-3xl font-bold tracking-tight md:text-4xl",
                    tier.featured ? "text-white" : "text-neutral-900 dark:text-neutral-100",
                  )}
                >
                  {tier.price}
                </span>
                <span
                  className={cn(
                    "text-base line-through",
                    tier.featured ? "text-neutral-400" : "text-neutral-400 dark:text-neutral-500",
                  )}
                >
                  {tier.oldPrice}
                </span>
              </p>
              <p
                className={cn(
                  "text-sm",
                  tier.featured ? "text-emerald-200" : "text-neutral-500 dark:text-neutral-400",
                )}
              >
                {tier.period}
              </p>

              <div className="mt-6 mb-2">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    tier.featured ? "text-emerald-300" : "text-neutral-700 dark:text-neutral-300",
                  )}
                >
                  المميزات
                </p>
              </div>
              <ul
                className={cn(
                  "mt-3 space-y-3 text-sm leading-6",
                  tier.featured ? "text-neutral-200" : "text-neutral-600 dark:text-neutral-300",
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-x-3">
                    <IconCircleCheckFilled
                      className={cn(
                        "h-5 w-5 flex-none",
                        tier.featured ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-500",
                      )}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <button
                className={cn(
                  "mt-8 block w-full rounded-xl px-3.5 py-3 text-center text-sm font-bold transition-all duration-200 active:scale-[0.98] sm:mt-10",
                  tier.featured
                    ? "bg-white text-emerald-900 shadow-lg shadow-emerald-500/20 hover:bg-emerald-50"
                    : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700",
                )}
              >
                أطلب عقدك الآن
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface Tier {
  name: string;
  id: string;
  price: string;
  oldPrice: string;
  period: string;
  features: string[];
  featured: boolean;
}

const tiers: Tier[] = [
  {
    name: "عقد سكني",
    id: "tier-residential",
    price: "249 ر.س",
    oldPrice: "549 ر.س",
    period: "السنة الواحدة",
    features: [
      "خلال 30 دقيقة",
      "بدون حضورك",
      "مناسب لحساب المواطن",
      "مناسب للضمان المطور",
      "مناسب لنظام بلدي",
      "يطلبه المؤجر أو المستأجر",
    ],
    featured: false,
  },
  {
    name: "عقد تجاري",
    id: "tier-commercial",
    price: "349 ر.س",
    oldPrice: "749 ر.س",
    period: "السنة الواحدة",
    features: [
      "خلال 30 دقيقة",
      "بدون حضورك",
      "مناسب لحساب المواطن",
      "مناسب للضمان المطور",
      "مناسب لنظام بلدي",
      "يطلبه المؤجر أو المستأجر",
    ],
    featured: true,
  },
];
