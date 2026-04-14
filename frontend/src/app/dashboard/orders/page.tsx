"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  IconPlus,
  IconSearch,
  IconFileDescription,
  IconCalendar,
  IconArrowLeft,
  IconInbox,
} from "@tabler/icons-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import DashboardShell from "@/components/dashboard/DashboardShell";
import NewContractModal from "@/components/dashboard/NewContractModal";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface Order {
  id: number;
  contract_number: string;
  status: string;
  property_type: string | null;
  city: string | null;
  district: string | null;
  annual_rent_amount: number | null;
  total_fees: number | null;
  contract_duration_years: number | null;
  current_step: number;
  created_at: string;
}

const filters = [
  { value: "", label: "الكل" },
  { value: "draft", label: "مسودة" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "completed", label: "مكتمل" },
  { value: "rejected", label: "مرفوض" },
];

const propertyLabels: Record<string, string> = {
  building: "عمارة",
  villa: "فيلا",
  apartment: "شقة",
  factory: "مصنع",
  land: "أرض",
  tower: "برج",
  plaza_open: "مجمع تجاري",
  plaza_closed: "مجمع تجاري",
  rest_house: "استراحة",
  farm: "مزرعة",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const qs = status ? `&status=${status}` : "";
    api.get(`my-contracts?action=list&limit=50${qs}`)
      .then((r) => setOrders(r.data ?? r ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [status]);

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.contract_number.toLowerCase().includes(q) ||
        (o.city && o.city.includes(search)) ||
        (o.district && o.district.includes(search))
    );
  }, [orders, search]);

  return (
    <DashboardShell title="الطلبات">
      <div className="mx-auto max-w-5xl p-5 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">الطلبات</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              تابع حالة عقودك لحظة بلحظة
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f] active:scale-[0.98]"
          >
            <IconPlus className="size-4" />
            طلب جديد
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm focus-within:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-900">
          <IconSearch className="size-5 text-neutral-400" />
          <input
            type="text"
            placeholder="ابحث برقم العقد أو المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:text-white"
          />
        </div>

        {/* Status filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all md:text-sm",
                status === f.value
                  ? "bg-[#0b7a5a] text-white shadow-md shadow-[#0b7a5a]/20"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl bg-white py-16 text-center shadow-sm dark:bg-neutral-900">
            <div className="mb-4 flex size-20 items-center justify-center rounded-3xl bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
              <IconInbox className="size-10" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
              ما عندك أي طلبات
            </h3>
            <p className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
              ابدأ رحلتك بإنشاء أول عقد إيجار لك معنا
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#0b7a5a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f]"
            >
              <IconPlus className="size-4" />
              إنشاء عقد
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order, idx) => (
              <OrderRow
                key={order.id}
                order={order}
                delay={idx * 0.03}
                onClick={() => {
                  if (order.status === "draft") {
                    router.push(`/contracts/new/commercial?contract_id=${order.id}`);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <NewContractModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardShell>
  );
}

function OrderRow({
  order,
  delay,
  onClick,
}: {
  order: Order;
  delay: number;
  onClick: () => void;
}) {
  const typeLabel = propertyLabels[order.property_type || ""] ?? order.property_type ?? "عقد";
  const date = new Date(order.created_at).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-5 dark:bg-neutral-900"
    >
      <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b7a5a]/10 to-emerald-500/10 text-[#0b7a5a] dark:text-emerald-400">
        <IconFileDescription className="size-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-neutral-900 md:text-base dark:text-white">
            عقد {typeLabel} {order.city && `— ${order.city}`}
          </h3>
          <StatusBadge status={order.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-neutral-500 md:text-xs dark:text-neutral-400">
          <span dir="ltr" className="font-mono">
            {order.contract_number}
          </span>
          <span className="flex items-center gap-1">
            <IconCalendar className="size-3" />
            {date}
          </span>
          {order.contract_duration_years && <span>• {order.contract_duration_years} سنة</span>}
          {order.status === "draft" && (
            <span className="font-semibold text-amber-600">• خطوة {order.current_step}/6</span>
          )}
        </div>
      </div>

      <div className="text-left">
        {order.annual_rent_amount != null && (
          <>
            <p className="text-[10px] text-neutral-400 md:text-xs">الإيجار السنوي</p>
            <p className="text-sm font-bold text-[#0b7a5a] md:text-base dark:text-emerald-400">
              {order.annual_rent_amount} ر.س
            </p>
          </>
        )}
      </div>
      <IconArrowLeft className="size-4 flex-shrink-0 text-neutral-300 transition-transform group-hover:-translate-x-1 dark:text-neutral-600" />
    </motion.button>
  );
}
