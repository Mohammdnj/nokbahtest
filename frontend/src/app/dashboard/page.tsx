"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  IconPlus,
  IconFileDescription,
  IconClock,
  IconCircleCheck,
  IconWallet,
  IconArrowLeft,
  IconSparkles,
} from "@tabler/icons-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import DashboardShell from "@/components/dashboard/DashboardShell";
import NewContractModal from "@/components/dashboard/NewContractModal";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface Stats {
  total: number;
  draft: number;
  pending: number;
  active: number;
  completed: number;
  total_paid: number;
}

interface RecentContract {
  id: number;
  contract_number: string;
  status: string;
  property_type: string | null;
  city: string | null;
  district: string | null;
  annual_rent_amount: number | null;
  created_at: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get("my-contracts?action=stats").then((r) => r.data ?? r).catch(() => null),
      api.get("my-contracts?action=list&limit=5").then((r) => r.data ?? r).catch(() => []),
    ])
      .then(([s, list]) => {
        setStats(s);
        setRecent(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <DashboardShell title="الرئيسية">
      <div className="mx-auto max-w-5xl p-5 md:p-8">
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
              <IconSparkles className="size-3" />
              أهلاً وسهلاً
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white md:text-4xl">
              حياك عميلنا {firstName} 👋
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/80 md:text-base">
              جاهز نوثّق لك عقد إيجار جديد خلال 25 دقيقة؟ اضغط زر إنشاء عقد وخلنا نبدأ.
            </p>

            <button
              onClick={() => setModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#0b7a5a] shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconPlus className="size-4" />
              إنشاء عقد جديد
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
          <StatCard
            icon={<IconFileDescription className="size-5" />}
            label="إجمالي العقود"
            value={stats?.total ?? 0}
            loading={loading}
            color="text-[#0b7a5a] bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
            delay={0.1}
          />
          <StatCard
            icon={<IconClock className="size-5" />}
            label="قيد المراجعة"
            value={stats?.pending ?? 0}
            loading={loading}
            color="text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400"
            delay={0.15}
          />
          <StatCard
            icon={<IconCircleCheck className="size-5" />}
            label="مكتمل"
            value={stats?.completed ?? 0}
            loading={loading}
            color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
            delay={0.2}
          />
          <StatCard
            icon={<IconWallet className="size-5" />}
            label="إجمالي المدفوع"
            value={`${stats?.total_paid ?? 0} ر.س`}
            loading={loading}
            color="text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400"
            delay={0.25}
          />
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3">
          <QuickAction
            title="إنشاء عقد سكني"
            description="وثّق عقد إيجار سكني بسرعة"
            emoji="🏠"
            price="249 ر.س"
            onClick={() => setModalOpen(true)}
          />
          <QuickAction
            title="إنشاء عقد تجاري"
            description="وثّق عقد إيجار تجاري"
            emoji="🏪"
            price="349 ر.س"
            onClick={() => setModalOpen(true)}
          />
          <QuickAction
            title="تواصل مع الدعم"
            description="متاحين 24/7"
            emoji="💬"
            price="مجاني"
            onClick={() =>
              window.open(
                "https://wa.me/966563214000?text=السلام%20عليكم،%20أحتاج%20مساعدة",
                "_blank"
              )
            }
          />
        </div>

        {/* Recent activity */}
        <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm md:p-8 dark:bg-neutral-900">
          <div className="mb-4 flex items-center justify-between md:mb-6">
            <h2 className="text-base font-bold text-neutral-800 md:text-lg dark:text-neutral-200">
              آخر الطلبات
            </h2>
            <button
              onClick={() => router.push("/dashboard/orders")}
              className="flex items-center gap-1 text-xs font-semibold text-[#0b7a5a] hover:underline md:text-sm dark:text-emerald-400"
            >
              عرض الكل
              <IconArrowLeft className="size-3" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              title="ما عندك أي طلبات بعد"
              description="أنشئ عقد إيجار جديد وخله يظهر هنا"
              action={
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#0b7a5a] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f]"
                >
                  <IconPlus className="size-4" />
                  إنشاء عقد
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {recent.map((c) => (
                <RecentContractRow key={c.id} contract={c} />
              ))}
            </div>
          )}
        </div>
      </div>

      <NewContractModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  loading: boolean;
  color: string;
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
        {icon}
      </div>
      <p className="text-xs text-neutral-500 md:text-sm dark:text-neutral-400">{label}</p>
      {loading ? (
        <div className="mt-1 h-7 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      ) : (
        <p className="mt-1 text-xl font-bold text-neutral-900 md:text-2xl dark:text-white">
          {value}
        </p>
      )}
    </motion.div>
  );
}

function QuickAction({
  title,
  description,
  emoji,
  price,
  onClick,
}: {
  title: string;
  description: string;
  emoji: string;
  price: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-5 dark:bg-neutral-900"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl dark:bg-emerald-950/40">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">{title}</p>
        <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>
      <span className="text-xs font-bold text-[#0b7a5a] dark:text-emerald-400">{price}</span>
    </button>
  );
}

function RecentContractRow({ contract }: { contract: RecentContract }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/dashboard/orders?id=${contract.id}`)}
      className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-4 text-right transition-all hover:border-[#0b7a5a]/30 hover:bg-neutral-50 dark:border-neutral-800/60 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-lg dark:bg-emerald-950/40">
        📄
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
            عقد {contract.property_type ?? ""} — {contract.city ?? "—"}
          </p>
          <StatusBadge status={contract.status} />
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400" dir="ltr">
          {contract.contract_number}
        </p>
      </div>
      {contract.annual_rent_amount != null && (
        <div className="text-left">
          <p className="text-xs text-neutral-400">الإيجار السنوي</p>
          <p className="text-sm font-bold text-[#0b7a5a] dark:text-emerald-400">
            {contract.annual_rent_amount} ر.س
          </p>
        </div>
      )}
    </button>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center md:py-12">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-neutral-100 text-3xl dark:bg-neutral-800">
        📂
      </div>
      <p className="text-sm font-bold text-neutral-800 md:text-base dark:text-neutral-200">{title}</p>
      <p className="mt-1 text-xs text-neutral-500 md:text-sm dark:text-neutral-400">{description}</p>
      {action}
    </div>
  );
}
