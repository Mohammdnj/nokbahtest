"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import createGlobe from "cobe";
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
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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

export default function BentoStatsGrid({
  stats,
  loading,
  recentActivity,
}: {
  stats: Stats | null;
  loading: boolean;
  recentActivity?: Array<{ id: number; title: string; body: string; created_at: string }>;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:auto-rows-[min-content] md:grid-cols-5">
      {/* Total contracts — large hero card with animated globe-style background */}
      <Card className="md:col-span-3 md:row-span-2">
        <CardSkeletonBody className="h-56 md:h-72">
          <GlobeWidget pendingCount={stats?.pending_contracts ?? 0} />
        </CardSkeletonBody>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <CardTitle>إجمالي العقود</CardTitle>
              <CardDescription>عدد العقود المسجلة في المنصة منذ الانطلاق</CardDescription>
            </div>
            <div className="text-left">
              {loading ? (
                <div className="h-12 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              ) : (
                <div className="text-4xl font-bold text-[#0b7a5a] dark:text-emerald-400">
                  {(stats?.total_contracts ?? 0).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card className="md:col-span-2">
        <CardSkeletonBody className="h-32">
          <RevenueChart value={stats?.total_revenue ?? 0} />
        </CardSkeletonBody>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
                <IconWallet className="size-5" />
              </div>
              <CardTitle className="text-sm">إجمالي الإيرادات</CardTitle>
            </div>
            {loading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-neutral-200" />
            ) : (
              <div className="text-lg font-bold text-[#0b7a5a] dark:text-emerald-400">
                {(stats?.total_revenue ?? 0).toLocaleString()} ر.س
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending */}
      <SmallStat
        loading={loading}
        icon={<IconClock className="size-5" />}
        label="قيد المراجعة"
        value={stats?.pending_contracts ?? 0}
        color="amber"
        className="md:col-span-1"
      />
      <SmallStat
        loading={loading}
        icon={<IconCircleCheck className="size-5" />}
        label="مكتمل"
        value={stats?.completed_contracts ?? 0}
        color="emerald"
        className="md:col-span-1"
      />

      {/* Live activity feed */}
      <Card className="md:col-span-3">
        <CardContent>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
              <IconActivity className="size-5" />
            </div>
            <CardTitle className="text-sm">النشاط الحي</CardTitle>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
              </span>
              مباشر
            </span>
          </div>
          {recentActivity && recentActivity.length > 0 ? (
            <ul className="space-y-2">
              {recentActivity.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-start gap-2 rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-800/40">
                  <div className="mt-1 size-2 flex-shrink-0 rounded-full bg-[#0b7a5a]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-neutral-800 dark:text-neutral-200">{a.title}</p>
                    <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">{a.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl bg-neutral-50 p-4 text-center text-xs text-neutral-400 dark:bg-neutral-800/40">
              في انتظار النشاط...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <SmallStat
        loading={loading}
        icon={<IconUsers className="size-5" />}
        label="المستخدمين"
        value={stats?.total_users ?? 0}
        color="purple"
        className="md:col-span-1"
      />
      <SmallStat
        loading={loading}
        icon={<IconUserCog className="size-5" />}
        label="الموظفين"
        value={stats?.total_employees ?? 0}
        color="blue"
        className="md:col-span-1"
      />
      <SmallStat
        loading={loading}
        icon={<IconDiscount2 className="size-5" />}
        label="خصومات نشطة"
        value={stats?.active_discounts ?? 0}
        color="rose"
        className="md:col-span-1"
      />
      <SmallStat
        loading={loading}
        icon={<IconReceipt2 className="size-5" />}
        label="فواتير اليوم"
        value={stats?.invoices_today ?? 0}
        color="teal"
        className="md:col-span-2"
      />
    </div>
  );
}

// ---------- Card primitives ----------

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group isolate flex flex-col overflow-hidden rounded-3xl border border-neutral-200/60 bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.04)] dark:border-neutral-800/60 dark:bg-neutral-900",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

function CardSkeletonBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative h-full w-full overflow-hidden", className)}>{children}</div>;
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5 md:p-6", className)}>{children}</div>;
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-bold tracking-tight text-neutral-800 dark:text-neutral-100", className)}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mt-2 text-xs text-neutral-500 md:text-sm dark:text-neutral-400", className)}>
      {children}
    </p>
  );
}

// ---------- Small stat tile ----------

function SmallStat({
  loading,
  icon,
  label,
  value,
  color,
  className,
}: {
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: "amber" | "emerald" | "purple" | "blue" | "rose" | "teal";
  className?: string;
}) {
  const colorClasses = {
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    emerald: "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
  }[color];

  return (
    <Card className={className}>
      <CardContent>
        <div className={cn("mb-3 flex size-10 items-center justify-center rounded-xl", colorClasses)}>
          {icon}
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        ) : (
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Animated globe widget ----------

function GlobeWidget({ pendingCount }: { pendingCount: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let phi = 0;
    // cobe's TS types miss onRender — cast to any to use the runtime API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.25,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.95, 0.98, 0.96],
      markerColor: [11 / 255, 122 / 255, 90 / 255],
      glowColor: [0.85, 0.95, 0.9],
      markers: [
        { location: [24.7136, 46.6753], size: 0.08 },
        { location: [21.3891, 39.8579], size: 0.06 },
        { location: [21.4858, 39.1925], size: 0.05 },
        { location: [26.4207, 50.0888], size: 0.04 },
        { location: [24.4709, 39.6122], size: 0.04 },
      ],
      onRender: (state: { phi: number }) => {
        state.phi = phi;
        phi += 0.005;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    return () => globe.destroy();
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20" />
      <canvas
        ref={canvasRef}
        style={{ width: 380, height: 380, maxWidth: "100%", aspectRatio: 1 }}
        className="relative -mb-20 opacity-90 md:-mb-16"
      />
      {pendingCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#0b7a5a] shadow-lg dark:bg-neutral-800 dark:text-emerald-400"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
          </span>
          {pendingCount} عقد جديد
        </motion.div>
      )}
    </div>
  );
}

// ---------- Small revenue chart sparkline ----------

function RevenueChart({ value }: { value: number }) {
  // Simple decorative sparkline
  return (
    <div className="relative flex h-full w-full items-end justify-around p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 to-transparent dark:from-emerald-950/20" />
      {[0.4, 0.6, 0.5, 0.75, 0.6, 0.85, 0.7, 0.95].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h * 100}%` }}
          transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
          className="relative w-2 rounded-full bg-gradient-to-t from-[#0b7a5a] to-emerald-400 md:w-3"
        />
      ))}
      <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] font-bold text-[#0b7a5a]">
        <IconTrendingUp className="size-3" />
        +12%
      </div>
    </div>
  );
}
