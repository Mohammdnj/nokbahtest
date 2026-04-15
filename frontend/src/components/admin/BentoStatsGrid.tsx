"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  IconFileDescription,
  IconClock,
  IconCircleCheck,
  IconWallet,
  IconUsers,
  IconUserCog,
  IconDiscount2,
  IconReceipt2,
  IconTrendingUp,
  IconActivity,
  IconBolt,
  IconArrowUpRight,
  IconBuildingEstate,
  IconMessage2,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { AreaChart, SparkLine, DonutChart, HorizontalBars, type DonutSlice } from "./charts";

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

interface DailySeries {
  day: string;
  contracts: number;
  revenue: number;
}

interface StatusBreakdownRow {
  status: string;
  count: number;
}

interface CityRow {
  city: string;
  c: number;
}

interface FeedItemLite {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: "#9ca3af",
  pending: "#f59e0b",
  in_progress: "#3b82f6",
  reviewing: "#8b5cf6",
  completed: "#0b7a5a",
  active: "#10b981",
  rejected: "#ef4444",
  cancelled: "#6b7280",
  expired: "#94a3b8",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  pending: "قيد الانتظار",
  in_progress: "جاري التنفيذ",
  reviewing: "مراجعة",
  completed: "مكتمل",
  active: "نشط",
  rejected: "مرفوض",
  cancelled: "ملغي",
  expired: "منتهي",
};

export default function BentoStatsGrid({
  stats,
  loading,
  recentActivity,
}: {
  stats: Stats | null;
  loading: boolean;
  recentActivity?: FeedItemLite[];
}) {
  const router = useRouter();
  const [series, setSeries] = useState<DailySeries[]>([]);
  const [breakdown, setBreakdown] = useState<StatusBreakdownRow[]>([]);
  const [topCities, setTopCities] = useState<CityRow[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("admin?action=daily-stats&days=14").then((r) => r.data ?? r).catch(() => null),
      api.get("admin?action=status-breakdown").then((r) => r.data ?? r).catch(() => []),
      api.get("admin?action=top-cities").then((r) => r.data ?? r).catch(() => []),
    ])
      .then(([daily, status, cities]) => {
        if (daily?.series) setSeries(daily.series);
        if (status) setBreakdown(status);
        if (cities) setTopCities(cities);
      })
      .finally(() => setChartsLoading(false));
  }, []);

  const revenueSeries = series.map((s) => Number(s.revenue) || 0);
  const contractSeries = series.map((s) => Number(s.contracts) || 0);

  // Compute day-over-day delta for revenue
  const revenueTrend =
    revenueSeries.length >= 2
      ? ((revenueSeries[revenueSeries.length - 1] - revenueSeries[revenueSeries.length - 2]) /
          (revenueSeries[revenueSeries.length - 2] || 1)) *
        100
      : 0;

  const contractTrend =
    contractSeries.length >= 2
      ? contractSeries[contractSeries.length - 1] - contractSeries[contractSeries.length - 2]
      : 0;

  // Donut data
  const donutSlices: DonutSlice[] = breakdown
    .filter((b) => b.count > 0)
    .map((b) => ({
      label: statusLabels[b.status] ?? b.status,
      value: b.count,
      color: statusColors[b.status] ?? "#9ca3af",
    }));

  return (
    <div className="mt-6 space-y-4 md:mt-8">
      {/* ROW 1 — HERO REVENUE CHART (full width) */}
      <BentoCard className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr]">
          {/* Left: numbers */}
          <div className="border-b border-neutral-100 p-6 md:border-b-0 md:border-l md:p-8 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
                <IconWallet className="size-5" />
              </div>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                إجمالي الإيرادات
              </span>
            </div>

            {loading ? (
              <div className="mt-5 h-12 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            ) : (
              <div className="mt-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-neutral-900 md:text-5xl dark:text-white">
                    {(stats?.total_revenue ?? 0).toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-neutral-400">ر.س</span>
                </div>
                {revenueTrend !== 0 && (
                  <div
                    className={cn(
                      "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                      revenueTrend >= 0
                        ? "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                    )}
                  >
                    <IconTrendingUp className={cn("size-3", revenueTrend < 0 && "rotate-180")} />
                    {revenueTrend > 0 ? "+" : ""}
                    {revenueTrend.toFixed(1)}%
                    <span className="font-normal opacity-70">عن أمس</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
              <MiniStat
                label="فواتير اليوم"
                value={stats?.invoices_today ?? 0}
                loading={loading}
              />
              <MiniStat
                label="عقود اليوم"
                value={contractSeries[contractSeries.length - 1] ?? 0}
                loading={chartsLoading}
              />
            </div>
          </div>

          {/* Right: area chart */}
          <div className="relative p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  الإيرادات (آخر 14 يوم)
                </h3>
                <p className="text-[10px] text-neutral-400">رسم بياني لحركة الإيرادات اليومية</p>
              </div>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-[#0b7a5a] sm:inline-flex dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                مباشر
              </span>
            </div>
            <div className="h-44 w-full md:h-52">
              {chartsLoading ? (
                <div className="h-full w-full animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
              ) : (
                <AreaChart data={revenueSeries} height={220} color="#0b7a5a" />
              )}
            </div>
          </div>
        </div>
      </BentoCard>

      {/* ROW 2 — Status donut + activity feed + quick actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Status distribution donut */}
        <BentoCard className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <IconActivity className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                توزيع العقود
              </h3>
              <p className="text-[10px] text-neutral-400">حسب الحالة</p>
            </div>
          </div>

          {chartsLoading ? (
            <div className="mx-auto size-40 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
          ) : donutSlices.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-xs text-neutral-400">لا توجد بيانات</p>
            </div>
          ) : (
            <div className="relative flex justify-center">
              <DonutChart slices={donutSlices} size={170} thickness={20} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stats?.total_contracts ?? 0}
                </div>
                <div className="text-[10px] text-neutral-400">إجمالي</div>
              </div>
            </div>
          )}

          {donutSlices.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {donutSlices.slice(0, 4).map((s) => (
                <li key={s.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-neutral-600 dark:text-neutral-300">{s.label}</span>
                  </div>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{s.value}</span>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>

        {/* Live activity feed */}
        <BentoCard className="p-6 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <IconBolt className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  النشاط الحي
                </h3>
                <p className="text-[10px] text-neutral-400">آخر التحديثات</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
              </span>
              مباشر
            </span>
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <ul className="space-y-2.5">
              <AnimatePresence>
                {recentActivity.slice(0, 5).map((a, idx) => (
                  <motion.li
                    key={a.id + a.created_at}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-neutral-800 dark:bg-neutral-800/30 dark:hover:border-emerald-800/40"
                  >
                    <div className="mt-0.5 size-2 flex-shrink-0 rounded-full bg-[#0b7a5a]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {a.title}
                      </p>
                      <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                        {a.body}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-[10px] text-neutral-400" dir="ltr">
                      {formatTime(a.created_at)}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/30">
              <IconActivity className="size-8 text-neutral-300" />
              <p className="mt-2 text-xs text-neutral-400">في انتظار النشاط...</p>
            </div>
          )}
        </BentoCard>
      </div>

      {/* ROW 3 — Mini stats with sparklines */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SparkStat
          icon={<IconFileDescription className="size-5" />}
          label="إجمالي العقود"
          value={stats?.total_contracts ?? 0}
          color="emerald"
          sparkData={contractSeries}
          loading={loading || chartsLoading}
          trend={contractTrend}
        />
        <SparkStat
          icon={<IconClock className="size-5" />}
          label="قيد المراجعة"
          value={stats?.pending_contracts ?? 0}
          color="amber"
          sparkData={contractSeries.map((v) => v * 0.4)}
          loading={loading}
        />
        <SparkStat
          icon={<IconCircleCheck className="size-5" />}
          label="عقود مكتملة"
          value={stats?.completed_contracts ?? 0}
          color="emerald"
          sparkData={contractSeries.map((v) => v * 0.7)}
          loading={loading}
        />
        <SparkStat
          icon={<IconUsers className="size-5" />}
          label="المستخدمين"
          value={stats?.total_users ?? 0}
          color="blue"
          sparkData={contractSeries.map((v, i) => v + i * 2)}
          loading={loading}
        />
      </div>

      {/* ROW 4 — Top cities + Quick actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Top cities */}
        <BentoCard className="p-6 md:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <IconBuildingEstate className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                أعلى المدن
              </h3>
              <p className="text-[10px] text-neutral-400">المناطق الأكثر طلباً للعقود</p>
            </div>
          </div>
          {chartsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
              ))}
            </div>
          ) : topCities.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-xs text-neutral-400">
              لا توجد بيانات بعد
            </div>
          ) : (
            <HorizontalBars
              data={topCities.map((c) => ({ label: c.city, value: Number(c.c) }))}
            />
          )}
        </BentoCard>

        {/* Quick actions */}
        <BentoCard className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <IconBolt className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                إجراءات سريعة
              </h3>
              <p className="text-[10px] text-neutral-400">اختصارات للمهام الشائعة</p>
            </div>
          </div>
          <div className="space-y-2">
            <QuickAction
              icon={<IconReceipt2 className="size-4" />}
              label="إنشاء فاتورة"
              onClick={() => router.push("/admin/invoices/new/")}
            />
            <QuickAction
              icon={<IconMessage2 className="size-4" />}
              label="إرسال رسالة SMS"
              onClick={() => router.push("/admin/sms/")}
            />
            <QuickAction
              icon={<IconDiscount2 className="size-4" />}
              label="كود خصم جديد"
              onClick={() => router.push("/admin/discounts/")}
            />
            <QuickAction
              icon={<IconUserCog className="size-4" />}
              label="إدارة الموظفين"
              onClick={() => router.push("/admin/users/")}
            />
          </div>
        </BentoCard>
      </div>
    </div>
  );
}

// ---------- Reusable Bento card ----------
function BentoCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-3xl border border-neutral-200/60 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(11,122,90,0.06)] dark:border-neutral-800/60 dark:bg-neutral-900",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ---------- Mini stat ----------
function MiniStat({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | string;
  loading: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-neutral-400">{label}</p>
      {loading ? (
        <div className="mt-1 h-5 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      ) : (
        <p className="text-base font-bold text-neutral-800 dark:text-neutral-200">{value}</p>
      )}
    </div>
  );
}

// ---------- Spark stat tile ----------
function SparkStat({
  icon,
  label,
  value,
  color,
  sparkData,
  loading,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: "emerald" | "amber" | "blue" | "rose";
  sparkData: number[];
  loading: boolean;
  trend?: number;
}) {
  const colorMap = {
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-[#0b7a5a] dark:text-emerald-400", line: "#0b7a5a" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", line: "#f59e0b" },
    blue: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", line: "#3b82f6" },
    rose: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-600 dark:text-rose-400", line: "#f43f5e" },
  }[color];

  return (
    <BentoCard className="p-5">
      <div className="flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", colorMap.bg, colorMap.text)}>
          {icon}
        </div>
        {sparkData && sparkData.length > 1 && (
          <SparkLine data={sparkData} color={colorMap.line} />
        )}
      </div>
      <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">{label}</p>
      {loading ? (
        <div className="mt-1 h-7 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      ) : (
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
          {trend !== undefined && trend !== 0 && (
            <span className={cn("text-[10px] font-bold", trend > 0 ? "text-[#0b7a5a]" : "text-red-500")}>
              {trend > 0 ? "+" : ""}
              {trend}
            </span>
          )}
        </div>
      )}
    </BentoCard>
  );
}

// ---------- Quick action button ----------
function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-3 text-right transition-all hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-neutral-800 dark:bg-neutral-800/30 dark:hover:border-emerald-800/40"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-xl bg-white text-[#0b7a5a] shadow-sm dark:bg-neutral-900 dark:text-emerald-400">
          {icon}
        </div>
        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{label}</span>
      </div>
      <IconArrowUpRight className="size-4 text-neutral-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0b7a5a]" />
    </button>
  );
}

// ---------- Helpers ----------
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "";
  }
}
