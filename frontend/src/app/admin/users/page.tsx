"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IconUserCircle, IconShield, IconUser, IconUserCog } from "@tabler/icons-react";
import AdminShell from "@/components/admin/AdminShell";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  role: "admin" | "employee" | "user";
  is_verified: number;
  created_at: string;
}

const roleFilters = [
  { value: "", label: "الكل", icon: IconUserCircle },
  { value: "admin", label: "مدراء", icon: IconShield },
  { value: "employee", label: "موظفين", icon: IconUserCog },
  { value: "user", label: "عملاء", icon: IconUser },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  const load = () => {
    setLoading(true);
    api.get(`admin?action=users${role ? `&role=${role}` : ""}`)
      .then((r) => setUsers(r.data ?? r ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [role]);

  const changeRole = async (id: number, newRole: string) => {
    await api.put("admin?action=update-user-role", { id, role: newRole });
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, role: newRole as User["role"] } : u)));
  };

  return (
    <AdminShell title="إدارة المستخدمين">
      <div className="mx-auto max-w-5xl p-5 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">المستخدمين</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            إدارة صلاحيات المستخدمين
          </p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {roleFilters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.value}
                onClick={() => setRole(f.value)}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all md:text-sm",
                  role === f.value
                    ? "bg-[#0b7a5a] text-white shadow-md shadow-[#0b7a5a]/20"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400"
                )}
              >
                <Icon className="size-4" />
                {f.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u, idx) => (
              <UserRow key={u.id} user={u} delay={idx * 0.03} onChangeRole={changeRole} />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function UserRow({
  user,
  delay,
  onChangeRole,
}: {
  user: User;
  delay: number;
  onChangeRole: (id: number, role: string) => void;
}) {
  const initials = user.name.charAt(0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm md:p-5 dark:bg-neutral-900"
    >
      <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0b7a5a] to-emerald-600 text-sm font-bold text-white">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-neutral-900 md:text-base dark:text-white">{user.name}</p>
        <p className="truncate text-xs text-neutral-500 md:text-sm dark:text-neutral-400" dir="ltr">
          +{user.phone}
        </p>
      </div>
      <select
        value={user.role}
        onChange={(e) => onChangeRole(user.id, e.target.value)}
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 outline-none focus:border-[#0b7a5a] md:text-sm dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
      >
        <option value="user">عميل</option>
        <option value="employee">موظف</option>
        <option value="admin">مدير</option>
      </select>
    </motion.div>
  );
}
