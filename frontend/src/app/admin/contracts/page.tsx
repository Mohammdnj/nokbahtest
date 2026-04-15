"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "motion/react";
import {
  IconSearch,
  IconFileDescription,
  IconCalendar,
  IconX,
  IconLoader2,
  IconUser,
  IconUsers,
  IconMapPin,
  IconRuler,
  IconCoin,
  IconFileText,
  IconBrandWhatsapp,
  IconReceipt2,
} from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge, { statusMeta } from "@/components/dashboard/StatusBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  { value: "draft", label: "مسودة" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "in_progress", label: "جاري التنفيذ" },
  { value: "reviewing", label: "مراجعة" },
  { value: "completed", label: "مكتمل" },
  { value: "rejected", label: "مرفوض" },
];

export default function AdminContractsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.role === "admin";
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contract | null>(null);

  useEffect(() => {
    // Wait for auth context to resolve so we know which endpoint to call.
    // Otherwise the page fires twice (once for null user, once for real user)
    // and the second response can clear the list if it errors.
    if (authLoading || !user) return;

    let cancelled = false;
    setLoading(true);
    const endpoint = isAdmin
      ? `admin?action=contracts${status ? `&status=${status}` : ""}`
      : `employee?action=queue${status ? `&status=${status}` : ""}`;

    api.get(endpoint)
      .then((r) => {
        if (cancelled) return;
        const data = r.data ?? r;
        // Only overwrite if we got an actual array — never blank out on
        // an unexpected shape.
        if (Array.isArray(data)) setContracts(data);
      })
      .catch((err) => {
        if (cancelled) return;
        // Don't clear an existing list on transient errors — just log.
        console.error("Failed to load contracts:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, isAdmin, authLoading, user]);

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

interface FullContract {
  id: number;
  contract_number: string;
  status: string;
  current_step: number;
  ejar_number: string | null;
  created_at: string;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;

  // Step 1
  owner_or_tenant: string | null;
  owner_alive: string | null;
  deed_type: string | null;
  property_type: string | null;
  property_usage: string | null;
  deed_number: string | null;
  deed_date: string | null;

  // Step 2
  region: string | null;
  city: string | null;
  district: string | null;
  street_name: string | null;
  building_number: string | null;
  postal_code: string | null;
  additional_number: string | null;

  // Step 3
  owner_name: string | null;
  owner_id_number: string | null;
  owner_dob: string | null;
  owner_phone: string | null;
  has_agent: number | null;
  agent_name: string | null;
  agent_id_number: string | null;
  agent_dob: string | null;
  agent_phone: string | null;

  // Step 4
  tenant_type: string | null;
  tenant_id_number: string | null;
  tenant_dob: string | null;
  tenant_phone: string | null;
  commercial_register: string | null;
  vat_number: string | null;
  company_name: string | null;

  // Step 5
  unit_type: string | null;
  unit_usage: string | null;
  unit_number: string | null;
  floor_number: string | null;
  unit_area: string | null;
  window_ac_count: number | null;
  split_ac_count: number | null;
  electricity_meter: string | null;
  water_meter: string | null;

  // Step 6
  contract_start_date: string | null;
  contract_duration_years: number | null;
  total_fees: string | null;
  annual_rent_amount: string | null;
  payment_method: string | null;
  additional_conditions: string | null;
}

const labelMaps = {
  owner_or_tenant: { owner: "المالك", tenant: "المستأجر" },
  owner_alive: { alive: "حي", deceased: "متوفى" },
  deed_type: {
    electronic: "صك إلكتروني",
    real_estate_registry: "صك السجل العقاري",
    paper: "صك ورقي",
  },
  property_type: {
    building: "عمارة",
    villa: "فيلا",
    plaza_open: "مجمع تجاري مفتوح",
    plaza_closed: "مجمع تجاري مغلق",
    land: "أرض",
    tower: "برج",
    factory: "مصنع",
    rest_house: "استراحة",
    farm: "مزرعة",
  },
  property_usage: {
    commercial: "تجاري",
    residential_commercial: "سكني - تجاري",
  },
  tenant_type: { individual: "فرد", establishment: "مؤسسة", company: "شركة" },
  unit_usage: { family: "سكن عائلات", individual: "سكن أفراد", collective: "سكن جماعي" },
  unit_type: {
    apartment: "شقة",
    villa: "فيلا",
    building: "عمارة",
    floor: "دور",
    studio: "استديو",
    duplex: "دوبلكس",
    office: "مكتب",
    warehouse: "مستودع",
    rest_house: "استراحة",
    farm: "مزرعة",
    land: "أرض",
    driver_room: "غرفة سائق",
    traditional: "بيت شعبي",
  },
  payment_method: {
    monthly: "شهري",
    quarterly: "ربع سنوي",
    semi_annual: "نصف سنوي",
    annual: "سنوي",
  },
} as const;

function lookup<T extends keyof typeof labelMaps>(
  field: T,
  value: string | null | undefined
): string {
  if (!value) return "—";
  const map = labelMaps[field] as Record<string, string>;
  return map[value] ?? value;
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
  const router = useRouter();
  const [full, setFull] = useState<FullContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [ejarNumber, setEjarNumber] = useState(contract.ejar_number ?? "");

  useEffect(() => {
    api.get(`employee?action=contract&id=${contract.id}`)
      .then((r) => {
        const body = r.data ?? r;
        setFull(body);
        setEjarNumber(body.ejar_number ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contract.id]);

  const c = full;
  const date = c?.created_at
    ? new Date(c.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const handleCreateInvoice = () => {
    if (!c) return;
    // Pre-fill query params for the invoice builder
    const params = new URLSearchParams({
      contract_id: String(c.id),
      recipient_name: c.client_name || "",
      recipient_phone: c.client_phone || "",
      amount: c.total_fees ?? "",
      description: `رسوم توثيق عقد إيجار ${lookup("property_type", c.property_type)} — ${c.contract_number}`,
    });
    router.push(`/admin/invoices/new/?${params.toString()}`);
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-x-0 bottom-0 top-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" dir="rtl">
        <div className="relative flex h-[94vh] w-full max-w-3xl flex-col rounded-t-[28px] bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-3xl dark:bg-neutral-900">
          {/* Header */}
          <div className="sticky top-0 z-10 rounded-t-[28px] border-b border-neutral-100 bg-white/95 px-5 pb-4 pt-3 backdrop-blur-xl sm:rounded-t-3xl sm:px-8 sm:pt-5 dark:border-neutral-800 dark:bg-neutral-900/95">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-200 sm:hidden dark:bg-neutral-700" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold md:text-xl">تفاصيل العقد</h2>
                  <StatusBadge status={contract.status} />
                </div>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400" dir="ltr">
                  {contract.contract_number}
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-400">{date}</p>
              </div>
              <button
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              >
                <IconX className="size-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4 sm:px-8">
            {loading || !c ? (
              <div className="flex items-center justify-center py-16">
                <IconLoader2 className="size-8 animate-spin text-[#0b7a5a]" />
              </div>
            ) : (
              <>
                {/* Client header card */}
                <div className="mb-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-4 dark:from-emerald-950/30 dark:to-neutral-800/30">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0b7a5a] text-white">
                      <IconUser className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-neutral-500">العميل</div>
                      <div className="truncate text-base font-bold text-neutral-900 dark:text-white">
                        {c.client_name || "—"}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500" dir="ltr">
                        <span>{c.client_phone || "—"}</span>
                        {c.client_email && <span>• {c.client_email}</span>}
                      </div>
                    </div>
                    {c.client_phone && (
                      <a
                        href={`https://wa.me/${c.client_phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-10 items-center justify-center rounded-xl bg-[#25D366] text-white"
                        title="واتساب"
                      >
                        <IconBrandWhatsapp className="size-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Sections */}
                <Section icon={<IconFileText className="size-4" />} title="بيانات الصك">
                  <Pair label="نوع الطرف" value={lookup("owner_or_tenant", c.owner_or_tenant)} />
                  <Pair label="حالة المالك" value={lookup("owner_alive", c.owner_alive)} />
                  <Pair label="نوع الصك" value={lookup("deed_type", c.deed_type)} />
                  <Pair label="نوع العقار" value={lookup("property_type", c.property_type)} />
                  <Pair label="استخدام العقار" value={lookup("property_usage", c.property_usage)} />
                  <Pair label="رقم الصك" value={c.deed_number || "—"} ltr />
                  <Pair label="تاريخ الصك" value={c.deed_date || "—"} ltr />
                </Section>

                <Section icon={<IconMapPin className="size-4" />} title="العنوان الوطني">
                  <Pair label="المنطقة" value={c.region || "—"} />
                  <Pair label="المدينة" value={c.city || "—"} />
                  <Pair label="الحي" value={c.district || "—"} />
                  <Pair label="الشارع" value={c.street_name || "—"} />
                  <Pair label="رقم المبنى" value={c.building_number || "—"} ltr />
                  <Pair label="الرمز البريدي" value={c.postal_code || "—"} ltr />
                  <Pair label="الرقم الإضافي" value={c.additional_number || "—"} ltr />
                </Section>

                <Section icon={<IconUser className="size-4" />} title="بيانات المالك">
                  <Pair label="الاسم" value={c.owner_name || "—"} />
                  <Pair label="رقم الهوية" value={c.owner_id_number || "—"} ltr />
                  <Pair label="تاريخ الميلاد" value={c.owner_dob || "—"} ltr />
                  <Pair label="الجوال" value={c.owner_phone || "—"} ltr />
                  {c.has_agent ? (
                    <>
                      <SectionDivider label="الوكيل" />
                      <Pair label="اسم الوكيل" value={c.agent_name || "—"} />
                      <Pair label="هوية الوكيل" value={c.agent_id_number || "—"} ltr />
                      <Pair label="تاريخ ميلاد الوكيل" value={c.agent_dob || "—"} ltr />
                      <Pair label="جوال الوكيل" value={c.agent_phone || "—"} ltr />
                    </>
                  ) : null}
                </Section>

                <Section icon={<IconUsers className="size-4" />} title="بيانات المستأجر">
                  <Pair label="نوع المستأجر" value={lookup("tenant_type", c.tenant_type)} />
                  <Pair label="الجوال" value={c.tenant_phone || "—"} ltr />
                  {c.tenant_type === "individual" ? (
                    <>
                      <Pair label="رقم الهوية" value={c.tenant_id_number || "—"} ltr />
                      <Pair label="تاريخ الميلاد" value={c.tenant_dob || "—"} ltr />
                    </>
                  ) : (
                    <>
                      <Pair label="اسم المنشأة" value={c.company_name || "—"} />
                      <Pair label="السجل التجاري" value={c.commercial_register || "—"} ltr />
                      {c.vat_number && <Pair label="الرقم الضريبي" value={c.vat_number} ltr />}
                    </>
                  )}
                </Section>

                <Section icon={<IconRuler className="size-4" />} title="بيانات الوحدة">
                  <Pair label="نوع الوحدة" value={lookup("unit_type", c.unit_type)} />
                  <Pair label="استخدام الوحدة" value={lookup("unit_usage", c.unit_usage)} />
                  <Pair label="رقم الوحدة" value={c.unit_number || "—"} ltr />
                  <Pair label="الدور" value={c.floor_number === "ground" ? "الأرضي" : c.floor_number || "—"} />
                  <Pair label="المساحة" value={c.unit_area ? `${c.unit_area} م²` : "—"} />
                  <Pair label="مكيفات الشباك" value={String(c.window_ac_count ?? 0)} />
                  <Pair label="مكيفات السبليت" value={String(c.split_ac_count ?? 0)} />
                  {c.electricity_meter && <Pair label="عداد الكهرباء" value={c.electricity_meter} ltr />}
                  {c.water_meter && <Pair label="عداد الماء" value={c.water_meter} ltr />}
                </Section>

                <Section icon={<IconCoin className="size-4" />} title="البيانات المالية">
                  <Pair label="بداية العقد" value={c.contract_start_date || "—"} ltr />
                  <Pair label="مدة العقد" value={c.contract_duration_years ? `${c.contract_duration_years} سنة` : "—"} />
                  <Pair
                    label="الإيجار السنوي"
                    value={c.annual_rent_amount ? `${Number(c.annual_rent_amount).toLocaleString()} ر.س` : "—"}
                    highlight
                  />
                  <Pair label="طريقة السداد" value={lookup("payment_method", c.payment_method)} />
                  <Pair
                    label="إجمالي الرسوم"
                    value={c.total_fees ? `${Number(c.total_fees).toLocaleString()} ر.س` : "—"}
                    highlight
                  />
                  {c.additional_conditions && (
                    <div className="rounded-xl bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30">
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-400">شروط إضافية</div>
                      <div className="mt-1 text-xs text-amber-900 dark:text-amber-300">{c.additional_conditions}</div>
                    </div>
                  )}
                </Section>
              </>
            )}
          </div>

          {/* Sticky action bar */}
          <div className="sticky bottom-0 z-10 border-t border-neutral-100 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl sm:px-8 dark:border-neutral-800 dark:bg-neutral-900/95">
            {/* Status stepper */}
            <StatusStepper currentStatus={contract.status} />

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={ejarNumber}
                onChange={(e) => setEjarNumber(e.target.value)}
                placeholder="رقم إيجار (اختياري)"
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
              />
              <StatusActionPicker
                currentStatus={contract.status}
                onChange={(newStatus) => onUpdate(contract.id, newStatus, ejarNumber || undefined)}
              />
            </div>

            {full && (
              <button
                onClick={handleCreateInvoice}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 hover:bg-[#0a6b4f]"
              >
                <IconReceipt2 className="size-4" />
                إنشاء فاتورة لهذا العقد
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="col-span-full mt-2 flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-400">
      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      {label}
      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}

function Pair({
  label,
  value,
  ltr,
  highlight,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl px-3 py-2",
        highlight
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : "bg-neutral-50 dark:bg-neutral-800/50"
      )}
    >
      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className={cn(
          "truncate text-xs font-bold",
          highlight ? "text-[#0b7a5a] dark:text-emerald-400" : "text-neutral-800 dark:text-neutral-200"
        )}
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </span>
    </div>
  );
}

// ============ STATUS STATE MACHINE ============
const STATUS_FLOW = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "in_progress", label: "جاري التنفيذ" },
  { value: "reviewing", label: "مراجعة" },
  { value: "completed", label: "مكتمل" },
] as const;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["pending", "cancelled"],
  pending: ["in_progress", "rejected", "cancelled"],
  in_progress: ["reviewing", "completed", "rejected"],
  reviewing: ["completed", "in_progress", "rejected"],
  completed: ["active"],
  active: ["expired", "cancelled"],
  rejected: ["in_progress"],
  cancelled: [],
  expired: [],
};

function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STATUS_FLOW.findIndex((s) => s.value === currentStatus);
  const isRejected = currentStatus === "rejected" || currentStatus === "cancelled";

  return (
    <div className="flex items-center justify-between gap-1" dir="rtl">
      {STATUS_FLOW.map((step, idx) => {
        const isPast = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isFuture = idx > currentIdx;
        return (
          <React.Fragment key={step.value}>
            <div className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                  isActive && !isRejected && "scale-110 bg-[#0b7a5a] text-white shadow-md shadow-[#0b7a5a]/30",
                  isActive && isRejected && "scale-110 bg-red-500 text-white",
                  isPast && "bg-emerald-100 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400",
                  isFuture && "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600"
                )}
              >
                {isPast ? "✓" : idx + 1}
              </div>
              <span
                className={cn(
                  "mt-1 text-[9px] font-bold",
                  isActive ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STATUS_FLOW.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-0.5 flex-1 rounded-full transition-colors",
                  isPast ? "bg-emerald-300 dark:bg-emerald-900/40" : "bg-neutral-200 dark:bg-neutral-800"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StatusActionPicker({
  currentStatus,
  onChange,
}: {
  currentStatus: string;
  onChange: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  const labels: Record<string, string> = {
    pending: "قيد الانتظار",
    in_progress: "جاري التنفيذ",
    reviewing: "مراجعة",
    completed: "مكتمل",
    active: "نشط",
    rejected: "مرفوض",
    cancelled: "إلغاء",
    expired: "منتهي",
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (allowed.length === 0) {
    return (
      <button
        disabled
        className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-bold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-800/50"
      >
        لا توجد إجراءات متاحة
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl bg-[#0b7a5a] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20"
      >
        <span>تغيير الحالة</span>
        <svg className={cn("size-4 transition-transform", open && "rotate-180")} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0l-4.25-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
          {allowed.map((status) => (
            <button
              key={status}
              onClick={() => {
                onChange(status);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between border-b border-neutral-100 px-4 py-3 text-right text-sm font-semibold transition-colors last:border-b-0 hover:bg-emerald-50 dark:border-neutral-800 dark:hover:bg-emerald-950/30"
            >
              <span>{labels[status] ?? status}</span>
              <span className="text-[10px] text-neutral-400">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
