"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  IconFileDescription,
  IconClock,
  IconCircleCheck,
  IconWallet,
  IconUsers,
  IconUserCog,
  IconDiscount2,
  IconReceipt2,
} from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Stats {
  total_contracts: number;
  pending_contracts: number;
  completed_contracts: number;
  total_revenue: number;
  total_users: number;
  total_employees: number;
  active_discounts: number;
  invoices_today: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user) return;
    const endpoint = isAdmin ? "admin?action=stats" : "employee?action=stats";
    api.get(endpoint)
      .then((r) => setStats(r.data ?? r))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  const cards = isAdmin
    ? [
        { label: "إجمالي العقود", value: stats?.total_contracts ?? 0, icon: IconFileDescription, color: "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400" },
        { label: "قيد المراجعة", value: stats?.pending_contracts ?? 0, icon: IconClock, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
        { label: "مكتمل", value: stats?.completed_contracts ?? 0, icon: IconCircleCheck, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
        { label: "إجمالي الإيرادات", value: `${(stats?.total_revenue ?? 0).toLocaleString()} ر.س`, icon: IconWallet, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
        { label: "المستخدمين", value: stats?.total_users ?? 0, icon: IconUsers, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" },
        { label: "الموظفين", value: stats?.total_employees ?? 0, icon: IconUserCog, color: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400" },
        { label: "خصومات نشطة", value: stats?.active_discounts ?? 0, icon: IconDiscount2, color: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" },
        { label: "فواتير اليوم", value: stats?.invoices_today ?? 0, icon: IconReceipt2, color: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400" },
      ]
    : [
        { label: "قيد الانتظار", value: (stats as unknown as { pending: number })?.pending ?? 0, icon: IconClock, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
        { label: "جاري التنفيذ", value: (stats as unknown as { in_progress: number })?.in_progress ?? 0, icon: IconFileDescription, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
        { label: "أنجزت اليوم", value: (stats as unknown as { completed_today: number })?.completed_today ?? 0, icon: IconCircleCheck, color: "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400" },
        { label: "فواتيري اليوم", value: (stats as unknown as { my_invoices_today: number })?.my_invoices_today ?? 0, icon: IconReceipt2, color: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400" },
      ];

  return (
    <AdminShell title={isAdmin ? "نظرة عامة" : "لوحة الموظف"}>
      <div className="mx-auto max-w-6xl p-5 md:p-8">
        {/* Welcome hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b7a5a] via-emerald-700 to-emerald-900 p-6 md:p-10"
        >
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 size-60 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {isAdmin ? "لوحة الإدارة" : "لوحة الموظف"}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white md:text-4xl">
              أهلاً {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/80 md:text-base">
              {isAdmin
                ? "راقب كل شيء يجري في المنصة من هنا"
                : "تابع العقود وأنشئ فواتير عملائك"}
            </p>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
          {cards.map((c, i) => (
            <StatCard key={i} {...c} loading={loading} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
  delay,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-white p-4 shadow-sm md:p-5 dark:bg-neutral-900"
    >
      <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="size-5" />
      </div>
      <p className="text-xs text-neutral-500 md:text-sm dark:text-neutral-400">{label}</p>
      {loading ? (
        <div className="mt-1 h-7 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      ) : (
        <p className="mt-1 text-xl font-bold text-neutral-900 md:text-2xl dark:text-white">{value}</p>
      )}
    </motion.div>
  );
}
