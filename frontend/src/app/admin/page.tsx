"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import AdminShell from "@/components/admin/AdminShell";
import BentoStatsGrid from "@/components/admin/BentoStatsGrid";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRealtimeFeed } from "@/lib/useRealtimeFeed";

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

  // Live activity feed
  const { items: feedItems } = useRealtimeFeed({ pollMs: 8000 });

  useEffect(() => {
    if (!user) return;
    api.get("admin?action=stats")
      .then((r) => setStats(r.data ?? r))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [user]);

  // Refetch stats whenever a new feed item arrives (so counts update live)
  useEffect(() => {
    if (!user || feedItems.length === 0) return;
    api.get("admin?action=stats")
      .then((r) => setStats(r.data ?? r))
      .catch(() => {});
  }, [user, feedItems.length]);

  return (
    <AdminShell title="نظرة عامة">
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
              لوحة الإدارة
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white md:text-4xl">
              أهلاً {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/80 md:text-base">
              راقب نبض المنصة كاملاً من هنا — التحديثات تصلك تلقائياً
            </p>
          </div>
        </motion.div>

        <BentoStatsGrid
          stats={stats}
          loading={loading}
          recentActivity={feedItems.map((f) => ({
            id: f.related_id,
            title: f.title,
            body: f.body,
            created_at: f.created_at,
          }))}
        />
      </div>
    </AdminShell>
  );
}
