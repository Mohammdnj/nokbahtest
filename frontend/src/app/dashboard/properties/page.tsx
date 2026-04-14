"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  IconBuildings,
  IconMapPin,
  IconRuler,
  IconPlus,
  IconSearch,
  IconBuildingEstate,
} from "@tabler/icons-react";
import { api } from "@/lib/api";
import DashboardShell from "@/components/dashboard/DashboardShell";
import NewContractModal from "@/components/dashboard/NewContractModal";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface Property {
  id: number;
  contract_number: string;
  property_type: string | null;
  property_usage: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
  street_name: string | null;
  building_number: string | null;
  postal_code: string | null;
  deed_number: string | null;
  unit_area: number | null;
  status: string;
  annual_rent_amount: number | null;
  created_at: string;
}

const propertyTypeLabels: Record<string, string> = {
  building: "عمارة",
  villa: "فيلا",
  plaza_open: "مجمع تجاري مفتوح",
  plaza_closed: "مجمع تجاري مغلق",
  land: "أرض",
  tower: "برج",
  factory: "مصنع",
  rest_house: "استراحة",
  farm: "مزرعة",
  apartment: "شقة",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get("my-contracts?action=properties")
      .then((r) => setProperties(r.data ?? r ?? []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.contract_number.toLowerCase().includes(q) ||
      (p.city && p.city.includes(search)) ||
      (p.district && p.district.includes(search)) ||
      (p.street_name && p.street_name.includes(search))
    );
  });

  return (
    <DashboardShell title="عقاراتي">
      <div className="mx-auto max-w-5xl p-5 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">عقاراتي</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              كل العقارات اللي وثّقت عقودها معنا
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f] active:scale-[0.98]"
          >
            <IconPlus className="size-4" />
            إضافة عقار جديد
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm focus-within:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-900">
          <IconSearch className="size-5 text-neutral-400" />
          <input
            type="text"
            placeholder="ابحث باسم المدينة، الحي، أو رقم العقد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:text-white"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl bg-white py-16 text-center shadow-sm dark:bg-neutral-900">
            <div className="mb-4 flex size-20 items-center justify-center rounded-3xl bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
              <IconBuildingEstate className="size-10" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
              {search ? "ما لقينا أي عقارات" : "ما عندك عقارات بعد"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
              {search
                ? "جرب كلمة بحث ثانية أو نظف الفلتر"
                : "لما توثّق عقدك الأول، عقارك بيظهر هنا تلقائي"}
            </p>
            {!search && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#0b7a5a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f]"
              >
                <IconPlus className="size-4" />
                إنشاء عقد جديد
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((p, idx) => (
              <PropertyCard key={p.id} property={p} delay={idx * 0.05} />
            ))}
          </div>
        )}
      </div>

      <NewContractModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardShell>
  );
}

function PropertyCard({ property, delay }: { property: Property; delay: number }) {
  const typeLabel = propertyTypeLabels[property.property_type || ""] ?? property.property_type ?? "عقار";
  const location = [property.city, property.district, property.street_name].filter(Boolean).join(" — ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-6 dark:bg-neutral-900"
    >
      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-emerald-500/5 blur-2xl transition-opacity group-hover:bg-emerald-500/10" />

      <div className="relative flex items-start justify-between">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b7a5a] to-emerald-700 text-white">
          <IconBuildings className="size-6" />
        </div>
        <StatusBadge status={property.status} />
      </div>

      <h3 className="relative mt-4 text-base font-bold text-neutral-900 md:text-lg dark:text-white">
        {typeLabel}
      </h3>

      <div className="relative mt-3 space-y-2">
        {location && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 md:text-sm dark:text-neutral-400">
            <IconMapPin className="size-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        {property.unit_area && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 md:text-sm dark:text-neutral-400">
            <IconRuler className="size-4 flex-shrink-0" />
            <span>{property.unit_area} م²</span>
          </div>
        )}
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <div>
          <p className="text-[10px] text-neutral-400 md:text-xs">رقم العقد</p>
          <p className="text-xs font-semibold text-neutral-700 md:text-sm dark:text-neutral-300" dir="ltr">
            {property.contract_number}
          </p>
        </div>
        {property.annual_rent_amount != null && (
          <div className="text-left">
            <p className="text-[10px] text-neutral-400 md:text-xs">الإيجار السنوي</p>
            <p className="text-sm font-bold text-[#0b7a5a] md:text-base dark:text-emerald-400">
              {property.annual_rent_amount} ر.س
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
