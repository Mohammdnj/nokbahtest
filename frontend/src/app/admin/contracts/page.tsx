"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { IconSearch, IconFileDescription, IconCalendar } from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge, { statusMeta } from "@/components/dashboard/StatusBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface Contract {
  id: number;
  contract_number: string;
  status: string;
  property_type: string | null;
  city: string | null;
  district: string | null;
  annual_rent_amount: number | null;
  total_fees: number | null;
  current_step: number;
  client_name: string | null;
  client_phone: string | null;
  created_at: string;
  ejar_number: string | null;
}

const filters = [
  { value: "", label: "الكل" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "in_progress", label: "جاري التنفيذ" },
  { value: "reviewing", label: "مراجعة" },
  { value: "completed", label: "مكتمل" },
  { value: "rejected", label: "مرفوض" },
];

export default function AdminContractsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contract | null>(null);

  useEffect(() => {
    setLoading(true);
    const endpoint = isAdmin
      ? `admin?action=contracts${status ? `&status=${status}` : ""}`
      : `employee?action=queue${status ? `&status=${status}` : ""}`;
    api.get(endpoint)
      .then((r) => setContracts(r.data ?? r ?? []))
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, [status, isAdmin]);

  const filtered = useMemo(() => {
    if (!search) return contracts;
    const q = search.toLowerCase();
    return contracts.filter(
      (c) =>
        c.contract_number.toLowerCase().includes(q) ||
        (c.client_name && c.client_name.includes(search)) ||
        (c.city && c.city.includes(search))
    );
  }, [contracts, search]);

  const updateStatus = async (id: number, newStatus: string, ejarNumber?: string) => {
    const endpoint = isAdmin ? "admin?action=update-contract-status" : "employee?action=update-status";
    await api.put(endpoint, { id, status: newStatus, ejar_number: ejarNumber });
    setContracts((list) =>
      list.map((c) => (c.id === id ? { ...c, status: newStatus, ejar_number: ejarNumber ?? c.ejar_number } : c))
    );
    if (selected?.id === id) setSelected(null);
  };

  return (
    <AdminShell title="إدارة العقود">
      <div className="mx-auto max-w-6xl p-5 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">العقود</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {isAdmin ? "كل العقود في المنصة" : "العقود الموكلة لك"}
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <IconSearch className="size-5 text-neutral-400" />
          <input
            type="text"
            placeholder="ابحث برقم العقد أو اسم العميل أو المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:text-white"
          />
        </div>

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

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
            <p className="text-neutral-500 dark:text-neutral-400">لا توجد عقود</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, idx) => (
              <ContractRow key={c.id} contract={c} delay={idx * 0.02} onClick={() => setSelected(c)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ContractDetailModal
          contract={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateStatus}
        />
      )}
    </AdminShell>
  );
}

function ContractRow({
  contract,
  delay,
  onClick,
}: {
  contract: Contract;
  delay: number;
  onClick: () => void;
}) {
  const date = new Date(contract.created_at).toLocaleDateString("ar-SA", {
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
      className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-5 dark:bg-neutral-900"
    >
      <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b7a5a]/10 to-emerald-500/10 text-[#0b7a5a] dark:text-emerald-400">
        <IconFileDescription className="size-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-neutral-900 md:text-base dark:text-white">
            {contract.client_name || "—"} {contract.city && `• ${contract.city}`}
          </h3>
          <StatusBadge status={contract.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-neutral-500 md:text-xs dark:text-neutral-400">
          <span dir="ltr" className="font-mono">
            {contract.contract_number}
          </span>
          <span className="flex items-center gap-1">
            <IconCalendar className="size-3" />
            {date}
          </span>
          {contract.client_phone && (
            <span dir="ltr" className="font-mono">
              {contract.client_phone}
            </span>
          )}
        </div>
      </div>

      {contract.annual_rent_amount != null && (
        <div className="text-left">
          <p className="text-[10px] text-neutral-400 md:text-xs">الإيجار</p>
          <p className="text-sm font-bold text-[#0b7a5a] md:text-base dark:text-emerald-400">
            {contract.annual_rent_amount} ر.س
          </p>
        </div>
      )}
    </motion.button>
  );
}

function ContractDetailModal({
  contract,
  onClose,
  onUpdate,
}: {
  contract: Contract;
  onClose: () => void;
  onUpdate: (id: number, status: string, ejar?: string) => void;
}) {
  const [ejarNumber, setEjarNumber] = useState(contract.ejar_number ?? "");

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-x-0 bottom-0 top-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" dir="rtl">
        <div className="relative flex h-[90vh] w-full max-w-lg flex-col rounded-t-[28px] bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl dark:bg-neutral-900">
          <div className="sticky top-0 rounded-t-[28px] border-b border-neutral-100 bg-white/95 px-5 pb-4 pt-5 backdrop-blur sm:rounded-t-3xl sm:px-8 dark:border-neutral-800 dark:bg-neutral-900/95">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-200 sm:hidden dark:bg-neutral-700" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold md:text-xl">إدارة العقد</h2>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400" dir="ltr">
                  {contract.contract_number}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4 sm:px-8">
            <dl className="space-y-3 text-sm">
              <Pair label="العميل" value={contract.client_name || "—"} />
              <Pair label="الجوال" value={contract.client_phone || "—"} ltr />
              <Pair label="المدينة" value={contract.city || "—"} />
              <Pair label="الحي" value={contract.district || "—"} />
              <Pair label="نوع العقار" value={contract.property_type || "—"} />
              <Pair
                label="الإيجار السنوي"
                value={contract.annual_rent_amount ? `${contract.annual_rent_amount} ر.س` : "—"}
              />
              <Pair
                label="الرسوم"
                value={contract.total_fees ? `${contract.total_fees} ر.س` : "—"}
              />
              <Pair label="الحالة الحالية" value={statusMeta[contract.status]?.label ?? contract.status} />
            </dl>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                رقم إيجار (اختياري)
              </label>
              <input
                type="text"
                value={ejarNumber}
                onChange={(e) => setEjarNumber(e.target.value)}
                placeholder="أدخل رقم العقد في شبكة إيجار"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div className="mt-6">
              <p className="mb-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                تحديث الحالة
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["in_progress", "reviewing", "completed", "rejected"].map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdate(contract.id, s, ejarNumber || undefined)}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 transition-all hover:border-[#0b7a5a] hover:bg-emerald-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    {statusMeta[s]?.label ?? s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Pair({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </span>
    </div>
  );
}
