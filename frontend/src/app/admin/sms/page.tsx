"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  IconLoader2,
  IconSend,
  IconUsers,
  IconUserCircle,
  IconBuildingBroadcastTower,
  IconCheck,
  IconAlertCircle,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
}

type Audience = "all" | "selected" | "manual";

export default function AdminSmsPage() {
  const [audience, setAudience] = useState<Audience>("all");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [manualPhones, setManualPhones] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ total: number; sent: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("admin?action=users&role=user")
      .then((r) => setUsers(r.data ?? r ?? []))
      .catch(() => setUsers([]));
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    return u.name.includes(search) || u.phone.includes(search);
  });

  const toggleSelect = (id: number) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    setError("");
    setResult(null);

    if (!message.trim()) return setError("الرسالة مطلوبة");
    if (message.length > 600) return setError("الرسالة طويلة جداً (600 حرف كحد أقصى)");

    const payload: Record<string, unknown> = { message };
    if (audience === "all") payload.all_users = true;
    else if (audience === "selected") {
      if (selected.size === 0) return setError("اختر مستخدماً واحداً على الأقل");
      payload.user_ids = Array.from(selected);
    } else {
      const phones = manualPhones.split(/[\s,;\n]+/).map((p) => p.trim()).filter(Boolean);
      if (phones.length === 0) return setError("أدخل رقم جوال واحداً على الأقل");
      payload.phones = phones;
    }

    setSending(true);
    try {
      const res = await api.post("sms?action=send", payload);
      const body = res.data ?? res;
      setResult({ total: body.total, sent: body.sent, failed: body.failed });
      if (body.sent > 0) {
        setMessage("");
        setSelected(new Set());
        setManualPhones("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الإرسال");
    } finally {
      setSending(false);
    }
  };

  const recipientCount = audience === "all" ? users.length : audience === "selected" ? selected.size : manualPhones.split(/[\s,;\n]+/).filter(Boolean).length;
  const charCount = message.length;
  const charLimit = 600;

  return (
    <AdminShell title="إرسال رسائل SMS">
      <div className="mx-auto max-w-4xl p-5 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
            إرسال رسائل SMS
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            أرسل رسالة لعميل واحد، مجموعة عملاء، أو الجميع
          </p>
        </div>

        {/* Audience picker */}
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <AudienceCard
            active={audience === "all"}
            onClick={() => setAudience("all")}
            icon={<IconBuildingBroadcastTower className="size-5" />}
            title="جميع العملاء"
            description={`${users.length} مستخدم`}
          />
          <AudienceCard
            active={audience === "selected"}
            onClick={() => setAudience("selected")}
            icon={<IconUsers className="size-5" />}
            title="عملاء محددين"
            description={`${selected.size} مختار`}
          />
          <AudienceCard
            active={audience === "manual"}
            onClick={() => setAudience("manual")}
            icon={<IconUserCircle className="size-5" />}
            title="أرقام يدوية"
            description="أدخل الأرقام مباشرة"
          />
        </div>

        {/* Selection details */}
        {audience === "selected" && (
          <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm dark:bg-neutral-900">
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-800">
              <IconSearch className="size-4 text-neutral-400" />
              <input
                type="text"
                placeholder="ابحث عن مستخدم..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none dark:text-white"
              />
              {selected.size > 0 && (
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-red-600 hover:underline"
                >
                  مسح الاختيار
                </button>
              )}
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredUsers.map((u) => {
                const isSelected = selected.has(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleSelect(u.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-right transition-colors",
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-5 items-center justify-center rounded-md border-2",
                        isSelected ? "border-[#0b7a5a] bg-[#0b7a5a]" : "border-neutral-300 dark:border-neutral-600"
                      )}
                    >
                      {isSelected && <IconCheck className="size-3 text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-neutral-800 dark:text-neutral-200">{u.name}</p>
                      <p className="truncate text-[10px] text-neutral-500" dir="ltr">+{u.phone}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {audience === "manual" && (
          <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm dark:bg-neutral-900">
            <label className="mb-2 block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              الأرقام (افصل بين كل رقم بفاصلة أو سطر جديد)
            </label>
            <textarea
              value={manualPhones}
              onChange={(e) => setManualPhones(e.target.value)}
              rows={4}
              dir="ltr"
              placeholder="966500000000, 966500000001"
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
            />
          </div>
        )}

        {/* Message composer */}
        <div className="rounded-3xl bg-white p-5 shadow-sm md:p-8 dark:bg-neutral-900">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              نص الرسالة
            </label>
            <span
              className={cn(
                "text-xs font-bold",
                charCount > charLimit ? "text-red-600" : "text-neutral-400"
              )}
            >
              {charCount} / {charLimit}
            </span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="اكتب رسالتك هنا..."
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-[#0b7a5a] dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              سيتم إرسال الرسالة إلى{" "}
              <span className="font-bold text-[#0b7a5a] dark:text-emerald-400">
                {recipientCount} مستلم
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              <IconAlertCircle className="size-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              <IconCheck className="size-4" />
              تم إرسال {result.sent} من أصل {result.total} رسالة
              {result.failed > 0 && ` (${result.failed} فشلت)`}
            </motion.div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || recipientCount === 0 || !message.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] py-4 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <>
                <IconLoader2 className="size-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <IconSend className="size-5" />
                إرسال الرسالة
              </>
            )}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

function AudienceCard({
  active,
  onClick,
  icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border-2 bg-white p-4 text-right transition-all active:scale-[0.98] dark:bg-neutral-900",
        active
          ? "border-[#0b7a5a] shadow-lg shadow-[#0b7a5a]/10"
          : "border-neutral-200 hover:border-[#0b7a5a]/40 dark:border-neutral-800"
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          active
            ? "bg-[#0b7a5a] text-white"
            : "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-neutral-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>
      {active && (
        <div className="flex size-5 items-center justify-center rounded-full bg-[#0b7a5a]">
          <IconCheck className="size-3 text-white" />
        </div>
      )}
    </button>
  );
}
