"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconShieldLock,
  IconBell,
  IconFileDescription,
  IconHelpCircle,
  IconLogout2,
  IconChevronLeft,
  IconBrandWhatsapp,
  IconEdit,
} from "@tabler/icons-react";
import { useAuth } from "@/lib/auth-context";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <DashboardShell title="حسابي">
      <div className="mx-auto max-w-3xl p-5 md:p-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b7a5a] via-emerald-700 to-emerald-900 p-6 md:p-8"
        >
          <div className="absolute -right-20 -top-20 size-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative flex items-center gap-4 md:gap-6">
            <div className="flex size-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white backdrop-blur md:size-24 md:text-4xl">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="truncate text-xl font-bold text-white md:text-2xl">{user.name}</h1>
              <p className="mt-1 truncate text-sm text-white/80" dir="ltr">
                +{user.phone}
              </p>
              {user.email && (
                <p className="mt-0.5 truncate text-xs text-white/70" dir="ltr">
                  {user.email}
                </p>
              )}
            </div>
            <button className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30">
              <IconEdit className="size-5" />
            </button>
          </div>
        </motion.div>

        {/* Personal info */}
        <Section title="المعلومات الشخصية" delay={0.1}>
          <InfoRow icon={<IconUser className="size-5" />} label="الاسم" value={user.name} />
          <InfoRow icon={<IconPhone className="size-5" />} label="الجوال" value={`+${user.phone}`} ltr />
          <InfoRow icon={<IconMail className="size-5" />} label="البريد" value={user.email || "غير مضاف"} ltr />
        </Section>

        {/* Settings */}
        <Section title="الإعدادات" delay={0.15}>
          <MenuItem
            icon={<IconShieldLock className="size-5" />}
            label="الأمان وكلمة المرور"
            description="تغيير كلمة المرور وإعدادات الأمان"
            onClick={() => {}}
          />
          <MenuItem
            icon={<IconBell className="size-5" />}
            label="الإشعارات"
            description="إدارة إشعارات الواتساب والرسائل"
            onClick={() => {}}
          />
        </Section>

        {/* Help */}
        <Section title="الدعم والمساعدة" delay={0.2}>
          <MenuItem
            icon={<IconHelpCircle className="size-5" />}
            label="الأسئلة الشائعة"
            description="إجابات على الأسئلة الأكثر تكراراً"
            onClick={() => router.push("/faq")}
          />
          <MenuItem
            icon={<IconFileDescription className="size-5" />}
            label="الشروط والأحكام"
            description="اتفاقية الوساطة العقارية"
            onClick={() => router.push("/terms")}
          />
          <MenuItem
            icon={<IconBrandWhatsapp className="size-5" />}
            label="تواصل عبر واتساب"
            description="فريق الدعم متاح 24/7"
            onClick={() =>
              window.open("https://wa.me/966563214000?text=السلام%20عليكم،%20أحتاج%20مساعدة", "_blank")
            }
          />
        </Section>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white py-4 text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 active:scale-[0.99] dark:border-red-900/40 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <IconLogout2 className="size-5" />
          تسجيل الخروج
        </motion.button>

        <p className="mt-6 text-center text-xs text-neutral-400">
          النخبة © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </div>
    </DashboardShell>
  );
}

function Section({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mt-6"
    >
      <h2 className="mb-3 text-sm font-bold text-neutral-600 md:text-base dark:text-neutral-400">{title}</h2>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">{children}</div>
    </motion.div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  ltr,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-neutral-100 px-5 py-4 last:border-b-0 dark:border-neutral-800">
      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-400">{label}</p>
        <p
          className="mt-0.5 truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200"
          dir={ltr ? "ltr" : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 border-b border-neutral-100 px-5 py-4 text-right transition-colors last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{label}</p>
        <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>
      <IconChevronLeft className="size-5 flex-shrink-0 text-neutral-300 transition-transform group-hover:-translate-x-0.5 dark:text-neutral-600" />
    </button>
  );
}
