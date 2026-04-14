"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  IconHome2,
  IconBuildings,
  IconFileInvoice,
  IconUser,
  IconBell,
  IconLogout2,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "الرئيسية", href: "/dashboard", icon: IconHome2 },
  { label: "عقاراتي", href: "/dashboard/properties", icon: IconBuildings },
  { label: "الطلبات", href: "/dashboard/orders", icon: IconFileInvoice },
  { label: "حسابي", href: "/dashboard/account", icon: IconUser },
];

export default function DashboardShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", !dark ? "dark" : "light");
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8ff] dark:bg-neutral-950">
        <div className="size-10 animate-spin rounded-full border-2 border-[#0b7a5a] border-t-transparent" />
      </div>
    );
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex min-h-screen bg-[#faf8ff] dark:bg-neutral-950" dir="rtl">
      {/* Desktop Sidebar (right side in RTL) */}
      <aside className="sticky top-0 hidden h-screen w-72 flex-col border-l border-neutral-200/60 bg-white md:flex dark:border-neutral-800/60 dark:bg-neutral-900">
        <div className="flex h-20 items-center justify-center border-b border-neutral-200/60 dark:border-neutral-800/60">
          <img src="/logolight.png" alt="النخبة" className="h-12 dark:hidden" />
          <img src="/logodark.png" alt="النخبة" className="hidden h-12 dark:block" />
        </div>

        <nav className="flex-1 space-y-1.5 p-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-right text-sm font-semibold transition-all",
                  active
                    ? "bg-[#0b7a5a] text-white shadow-lg shadow-[#0b7a5a]/20"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                )}
              >
                <Icon className="size-5" />
                <span className="flex-1 text-right">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    className="size-2 rounded-full bg-white"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User card at bottom */}
        <div className="border-t border-neutral-200/60 p-4 dark:border-neutral-800/60">
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0b7a5a] to-emerald-600 text-sm font-bold text-white">
              {firstName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {user.name}
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400" dir="ltr">
                +{user.phone}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDark}
              className="flex flex-1 items-center justify-center rounded-xl bg-neutral-100 p-2.5 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              {dark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 p-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <IconLogout2 className="size-4" />
              خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/80">
          <div className="flex h-16 items-center justify-between px-5 md:h-20 md:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <img src="/logolight.png" alt="النخبة" className="h-9 dark:hidden" />
              <img src="/logodark.png" alt="النخبة" className="hidden h-9 dark:block" />
            </div>
            <h1 className="hidden text-lg font-bold text-neutral-800 md:block dark:text-neutral-200">
              {title}
            </h1>
            <div className="flex items-center gap-2">
              <button className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">
                <IconBell className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200/60 bg-white/95 backdrop-blur-xl md:hidden dark:border-neutral-800/60 dark:bg-neutral-900/95">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="relative flex flex-col items-center gap-1 rounded-xl p-2 transition-colors"
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-xl bg-[#0b7a5a]/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 size-5 transition-colors",
                    active ? "text-[#0b7a5a] dark:text-emerald-400" : "text-neutral-400"
                  )}
                />
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-semibold transition-colors",
                    active ? "text-[#0b7a5a] dark:text-emerald-400" : "text-neutral-400"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
