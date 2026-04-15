"use client";
import React, { useEffect, useState } from "react";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import { api } from "@/lib/api";

interface SiteItem {
  group_key: string;
  content_key: string;
  content_value: string;
  content_label: string | null;
}

const groupLabels: Record<string, string> = {
  contact: "معلومات التواصل",
  pricing: "الأسعار",
  hero: "البانر الرئيسي",
};

export default function AdminContentPage() {
  const [items, setItems] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("admin?action=site-content")
      .then((r) => setItems(r.data ?? r ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const updateItem = (key: string, value: string) => {
    setItems((list) => list.map((i) => (i.content_key === key ? { ...i, content_value: value } : i)));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put("admin?action=update-site-content", {
        items: items.map((i) => ({
          group_key: i.group_key,
          content_key: i.content_key,
          content_value: i.content_value,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const grouped = items.reduce((acc, item) => {
    (acc[item.group_key] = acc[item.group_key] || []).push(item);
    return acc;
  }, {} as Record<string, SiteItem[]>);

  return (
    <AdminShell title="تعديل المحتوى">
      <div className="mx-auto max-w-3xl p-5 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">محتوى الموقع</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            عدّل النصوص والأسعار الظاهرة في الصفحة الرئيسية
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([group, groupItems]) => (
              <div key={group} className="rounded-3xl bg-white p-5 shadow-sm md:p-8 dark:bg-neutral-900">
                <h2 className="mb-4 text-base font-bold text-neutral-800 md:text-lg dark:text-neutral-200">
                  {groupLabels[group] ?? group}
                </h2>
                <div className="space-y-4">
                  {groupItems.map((item) => (
                    <div key={item.content_key}>
                      <label className="mb-1.5 block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        {item.content_label || item.content_key}
                      </label>
                      {item.content_value.length > 60 ? (
                        <textarea
                          value={item.content_value}
                          onChange={(e) => updateItem(item.content_key, e.target.value)}
                          rows={3}
                          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                        />
                      ) : (
                        <input
                          value={item.content_value}
                          onChange={(e) => updateItem(item.content_key, e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="sticky bottom-24 flex items-center gap-3 md:bottom-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] py-4 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/25 disabled:opacity-60 md:flex-none md:px-8"
              >
                {saving ? <IconLoader2 className="size-5 animate-spin" /> : saved && <IconCheck className="size-5" />}
                {saving ? "جاري الحفظ..." : saved ? "تم الحفظ" : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
