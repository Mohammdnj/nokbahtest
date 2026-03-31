"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { IconShieldCheck, IconClock, IconHeadset } from "@tabler/icons-react";

export default function WhyUs() {
  const features = [
    {
      icon: <IconShieldCheck className="size-7 text-emerald-600 md:size-8 dark:text-emerald-400" />,
      title: "ثقة عالية",
      description:
        "منصة سعودية 100% مرخصة من شبكة إيجار والهيئة العامة للعقار والمركز السعودي للأعمال وهيئة الاتصالات وتقنية المعلومات ... خلك في المضمون",
    },
    {
      icon: <IconClock className="size-7 text-emerald-600 md:size-8 dark:text-emerald-400" />,
      title: "نوفر وقتك",
      description:
        "وثّق عقدك دون الحاجة للبحث عن مكاتب عقارية ... وقتك ثمين جداً",
    },
    {
      icon: <IconHeadset className="size-7 text-emerald-600 md:size-8 dark:text-emerald-400" />,
      title: "دعم قوي",
      description:
        "تواصل مع فريقنا بشكل مباشر في أي وقت على مدار الساعة 24/7",
    },
  ];

  return (
    <section
      id="why-us"
      className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-24 lg:py-32"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center"
      >
        <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          مميزاتنا
        </span>
        <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-800 md:text-4xl dark:text-neutral-100">
          لماذا نحن وليس الآخرين؟
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-neutral-600 md:text-lg dark:text-neutral-400">
          أكثر من مجرد توثيق عقود — نوفّر لك تجربة متكاملة بسرعة واحترافية
          وبأعلى معايير الأمان.
        </p>
      </motion.div>

      {/* Conversation card first */}
      <div className="mt-10 flex justify-center md:mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className={cn(
            "group rounded-2xl border border-neutral-200/60 bg-white/50 p-3 transition-all duration-300 hover:border-emerald-200/60 hover:shadow-lg hover:shadow-emerald-500/5 md:p-4",
            "dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:hover:border-emerald-800/40 dark:hover:shadow-emerald-500/5"
          )}>
            <div className={cn("relative mb-3 h-48 overflow-hidden rounded-xl bg-neutral-50 mask-t-from-80% mask-b-from-80% md:mb-4 md:h-64 dark:bg-neutral-800/30")}>
              <SpeedExecution />
            </div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 md:text-xl dark:text-neutral-100">
              سرعة في الإنجاز
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 md:mt-4 md:text-sm dark:text-neutral-400">
              عقدك الإيجاري جاهز خلال 25 دقيقة فقط، بدون مواعيد أو انتظار. وقتك يهمنا.
            </p>
          </div>
        </motion.div>
      </div>

      {/* 3 feature cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mt-12 md:gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={cn(
              "group relative rounded-2xl border border-neutral-200/60 bg-white/50 p-5 transition-all duration-300 hover:border-emerald-200/60 hover:shadow-lg hover:shadow-emerald-500/5 md:p-8",
              "dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:hover:border-emerald-800/40 dark:hover:shadow-emerald-500/5"
            )}
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-50 md:size-14 dark:bg-emerald-950/40">
              {feature.icon}
            </div>
            <h3 className="text-base font-bold text-neutral-900 md:text-xl dark:text-neutral-100">
              {feature.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 md:mt-3 md:text-sm dark:text-neutral-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const SpeedExecution = () => {
  const steps = [
    { type: "system", content: "تم استلام طلبك بنجاح" },
    { type: "user", content: "أرسلت بيانات العقد" },
    { type: "system", content: "جاري مراجعة البيانات..." },
    { type: "system", content: "تم توثيق العقد في شبكة إيجار ✓" },
  ];
  return (
    <div className="flex h-full w-full flex-col rounded-lg p-3 md:p-4">
      <div className="flex flex-1 flex-col gap-4 overflow-hidden md:gap-6">
        {steps.map((step, index) =>
          step.type === "system" ? (
            <SystemMessage key={index} delay={index * 1.5}>{step.content}</SystemMessage>
          ) : (
            <UserMessage key={index} delay={index * 1.5}>{step.content}</UserMessage>
          )
        )}
      </div>
    </div>
  );
};

const SystemMessage = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div className="flex items-start gap-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay }} viewport={{ once: false }}>
    <img src="/logolight.png" width={24} height={24} alt="النخبة" className="size-5 flex-shrink-0 rounded-full bg-white object-contain p-0.5 shadow-sm ring-1 ring-neutral-200/60 md:size-6 dark:bg-neutral-800 dark:ring-neutral-700/60" />
    <div className="max-w-[85%] rounded-lg bg-white px-2.5 py-1.5 shadow-sm md:px-3 md:py-2 dark:bg-neutral-800">
      <div className="text-[10px] text-gray-700 md:text-xs dark:text-gray-200">{children}</div>
    </div>
  </motion.div>
);

const UserMessage = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div className="flex items-start justify-end gap-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay }} viewport={{ once: false }}>
    <div className="max-w-[85%] rounded-lg bg-emerald-500 px-2.5 py-1.5 text-white shadow-sm md:px-3 md:py-2">
      <div className="text-[10px] md:text-xs">{children}</div>
    </div>
    <img src="/customer-avatar.png" width={24} height={24} alt="عميل" className="size-5 flex-shrink-0 rounded-full object-cover md:size-6" />
  </motion.div>
);
