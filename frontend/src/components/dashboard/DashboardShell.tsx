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
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon?: React.ComponentType<{ className?: string }>;
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
        <div className="flex h-28 items-center justify-center border-b border-neutral-200/60 px-6 dark:border-neutral-800/60">
          <img src="/logolight.png" alt="النخبة" className="h-20 dark:hidden" />
          <img src="/logodark.png" alt="النخبة" className="hidden h-20 dark:block" />
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
                  <motion.div layoutId="nav-dot" className="size-2 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>

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
        {/* Top bar — mobile-optimized */}
        <header className="sticky top-0 z-30 border-b border-neutral-200/60 bg-white/85 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/85">
          <div className="flex h-[72px] items-center justify-between px-4 md:h-20 md:px-8">
            {/* Mobile: logo + greeting */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b7a5a] to-emerald-700 p-2 shadow-md shadow-[#0b7a5a]/20">
                <img src="/icon.png" alt="النخبة" className="h-full w-auto object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400">مرحباً بعودتك</p>
                <p className="truncate text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {firstName}
                </p>
              </div>
            </div>
            <h1 className="hidden text-lg font-bold text-neutral-800 md:block dark:text-neutral-200">
              {title}
            </h1>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleDark}
                className="md:hidden rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                {dark ? <IconSun className="size-5" /> : <IconMoon className="size-5" />}
              </button>
              <button className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">
                <IconBell className="size-5" />
                <span className="absolute right-1.5 top-1.5 flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-red-500"></span>
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden pb-36 md:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav — floating pill design */}
      <MobileBottomNav pathname={pathname} onNavigate={(href) => router.push(href)} />
    </div>
  );
}

function MobileBottomNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      dir="rtl"
      style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      {/* Gradient fade behind the nav so content underneath fades out */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#faf8ff] via-[#faf8ff]/85 to-transparent dark:from-neutral-950 dark:via-neutral-950/85" />

      {/* Floating pill card, nudged up from the edge */}
      <div className="relative mx-auto max-w-md px-4">
        <div className="relative rounded-[28px] border border-neutral-200/70 bg-white/98 p-2 shadow-[0_20px_50px_-12px_rgba(11,122,90,0.3),0_0_0_1px_rgba(11,122,90,0.04)] backdrop-blur-2xl dark:border-neutral-800/70 dark:bg-neutral-900/98">
          <div className="relative grid grid-cols-4 gap-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => onNavigate(item.href)}
                  className="group relative flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 transition-colors active:scale-[0.96]"
                >
                  {/* Active tab: solid emerald card */}
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#0b7a5a] to-emerald-800 shadow-lg shadow-[#0b7a5a]/40"
                    />
                  )}

                  <motion.div
                    animate={{
                      y: active ? -1 : 0,
                      scale: active ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", bounce: 0.45, duration: 0.4 }}
                    className="relative z-10"
                  >
                    <Icon
                      className={cn(
                        "size-[22px] transition-colors",
                        active ? "text-white" : "text-neutral-500 dark:text-neutral-400"
                      )}
                    />
                  </motion.div>

                  <span
                    className={cn(
                      "relative z-10 text-[11px] font-bold leading-none transition-colors",
                      active ? "text-white" : "text-neutral-500 dark:text-neutral-400"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Small dot indicator below active tab (extra visual cue) */}
                  {active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative z-10 mt-0.5 block size-1 rounded-full bg-white"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
