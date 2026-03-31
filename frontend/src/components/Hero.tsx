"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { NoiseBackground } from "@/components/ui/noise-background";

export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden pt-8 pb-4 md:pt-20 lg:pt-28" dir="rtl">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -top-40 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(16,185,129,0.12),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(16,185,129,0.06),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-center md:justify-start"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            عقدك الموثق من شبكة إيجار خلال 25 دقيقة
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-3xl font-bold leading-tight tracking-tight md:text-right md:text-5xl lg:text-6xl"
        >
          عقد إيجار إلكتروني
          <br />
          <span className="bg-gradient-to-l from-emerald-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-300">
            موثّق ومعتمد
          </span>{" "}
          من شبكة إيجار
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-2xl py-6 text-center text-sm leading-relaxed text-neutral-600 md:mx-0 md:text-right md:text-lg dark:text-neutral-400"
        >
          وثّق عقدك الإيجاري بكل سهولة وأنت في مكانك، سواء كنت مالك عقار أو
          مستأجر أو وسيط عقاري. نوفّر لك خدمة احترافية سريعة ومعتمدة تغنيك عن
          زيارة المكاتب العقارية — لحساب المواطن، الضمان الاجتماعي، حافز، أو أي
          جهة تطلب إثبات سكن.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center gap-3 sm:flex-row-reverse"
        >
          <NoiseBackground
            containerClassName="w-fit p-1.5 rounded-full"
            gradientColors={[
              "rgb(34, 197, 94)",
              "rgb(16, 185, 129)",
              "rgb(5, 150, 105)",
            ]}
          >
            <button className="h-full w-full cursor-pointer rounded-full bg-linear-to-r from-neutral-100 via-neutral-100 to-white px-5 py-2.5 text-sm font-medium text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-98 md:px-6 md:text-base dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
              أنشئ عقدك الآن &larr;
            </button>
          </NoiseBackground>
        </motion.div>

        {/* Hero images */}
        <LandingImages />
      </div>
    </div>
  );
}

export const LandingImages = () => {
  return (
    <div className="relative mt-10 min-h-[200px] w-full sm:min-h-[300px] md:mt-16 md:min-h-[400px] lg:min-h-[500px]">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="perspective-[4000px]"
      >
        <img
          src="/hero1.png"
          alt="لوحة تحكم العقود"
          height={1080}
          width={1920}
          className={cn(
            "absolute inset-0 w-full rounded-xl border border-neutral-200/50 shadow-2xl dark:border-neutral-800/50",
            "mask-b-from-60% sm:mask-b-from-70% md:mask-b-from-80%",
            "mask-r-from-30% sm:mask-r-from-40%"
          )}
          style={{
            transform: "rotateY(15deg) rotateX(30deg) rotateZ(-12deg)",
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        className="translate-x-8 -translate-y-4 sm:translate-x-16 sm:-translate-y-8 md:translate-x-20 md:-translate-y-16 lg:-translate-y-32"
      >
        <img
          src="/hero2.png"
          alt="نموذج عقد إيجار"
          height={1080}
          width={1920}
          className={cn(
            "absolute inset-0 w-full -translate-x-4 rounded-xl border border-neutral-200/50 shadow-2xl sm:-translate-x-8 md:-translate-x-10 dark:border-neutral-800/50",
            "mask-b-from-60% sm:mask-b-from-70% md:mask-b-from-80%",
            "mask-r-from-50% sm:mask-r-from-60%"
          )}
          style={{
            transform: "rotateY(15deg) rotateX(30deg) rotateZ(-12deg)",
          }}
        />
      </motion.div>
    </div>
  );
};
