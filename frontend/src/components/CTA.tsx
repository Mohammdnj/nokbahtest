"use client";
import { cn } from "@/lib/utils";
import { IconMessageCircleQuestion } from "@tabler/icons-react";
import React from "react";
import { HiArrowRight } from "react-icons/hi2";
import { motion } from "motion/react";

export default function CTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      dir="rtl"
      className="relative z-20 mx-4 my-16 max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white md:mx-auto md:my-40 dark:from-neutral-900 dark:to-neutral-950"
    >
      <GridLineHorizontal className="top-0" offset="200px" />
      <GridLineHorizontal className="bottom-0 top-auto" offset="200px" />
      <GridLineVertical className="right-0" offset="80px" />
      <GridLineVertical className="left-0 right-auto" offset="80px" />

      <div className="p-6 md:p-14">
        <h2 className="text-right text-lg font-medium tracking-tight text-neutral-500 md:text-3xl dark:text-neutral-200">
          جاهز تنشئ عقدك{" "}
          <span className="font-bold text-neutral-900 dark:text-white">
            بأقل من 25 دقيقة؟
          </span>
        </h2>
        <p className="mt-3 max-w-lg text-right text-base font-medium tracking-tight text-neutral-500 md:mt-4 md:text-3xl dark:text-neutral-200">
          احصل على{" "}
          <span className="text-emerald-600 dark:text-emerald-400">عقد إيجار موثّق</span> من شبكة
          إيجار بكل{" "}
          <span className="text-emerald-700 dark:text-emerald-300">سهولة واحترافية</span>.
        </p>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] group md:mt-8 md:text-base">
            <span>أنشئ عقدك الآن</span>
            <HiArrowRight className="mt-0.5 h-3.5 w-3.5 rotate-180 text-white transition-transform duration-200 group-hover:-translate-x-1" />
          </button>
          <button className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 active:scale-[0.98] group sm:mt-6 md:mt-8 md:text-base dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
            <span>تواصل معنا</span>
            <IconMessageCircleQuestion className="mt-0.5 h-4 w-4 text-neutral-500 transition-transform duration-200 group-hover:-translate-x-1 dark:text-neutral-400" />
          </button>
        </div>
      </div>

    </motion.section>
  );
}

const GridLineHorizontal = ({ className, offset }: { className?: string; offset?: string }) => (
  <div
    style={{
      "--background": "#ffffff",
      "--color": "rgba(0, 0, 0, 0.1)",
      "--height": "1px",
      "--width": "5px",
      "--fade-stop": "90%",
      "--offset": offset || "200px",
      "--color-dark": "rgba(255, 255, 255, 0.1)",
      maskComposite: "exclude",
    } as React.CSSProperties}
    className={cn(
      "absolute w-[calc(100%+var(--offset))] h-[var(--height)] left-[calc(var(--offset)/2*-1)]",
      "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
      "[background-size:var(--width)_var(--height)]",
      "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
      "[mask-composite:exclude]",
      "z-30",
      "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
      className
    )}
  />
);

const GridLineVertical = ({ className, offset }: { className?: string; offset?: string }) => (
  <div
    style={{
      "--background": "#ffffff",
      "--color": "rgba(0, 0, 0, 0.1)",
      "--height": "5px",
      "--width": "1px",
      "--fade-stop": "90%",
      "--offset": offset || "150px",
      "--color-dark": "rgba(255, 255, 255, 0.1)",
      maskComposite: "exclude",
    } as React.CSSProperties}
    className={cn(
      "absolute h-[calc(100%+var(--offset))] w-[var(--width)] top-[calc(var(--offset)/2*-1)]",
      "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
      "[background-size:var(--width)_var(--height)]",
      "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
      "[mask-composite:exclude]",
      "z-30",
      "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
      className
    )}
  />
);
