"use client";
import React, { useState, useEffect } from "react";
import { IconMenu2, IconX, IconSun, IconMoon } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    if (!dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-neutral-200/60 bg-white/90 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-950/90"
          : "bg-white/60 backdrop-blur-md dark:bg-neutral-950/60"
      }`}
      dir="rtl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img src="/logolight.png" alt="النخبة" className="h-12 md:h-14 dark:hidden" />
          <img src="/logodark.png" alt="النخبة" className="hidden h-9 md:h-10 dark:block" />
        </a>

        {/* Desktop nav - center links */}
        <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
          <a href="/" className="text-sm font-medium text-neutral-600 transition-colors hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400">الرئيسية</a>
          <a href="#why-us" className="text-sm font-medium text-neutral-600 transition-colors hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400">لماذا نحن</a>
          <a href="/faq" className="text-sm font-medium text-neutral-600 transition-colors hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400">الأسئلة الشائعة</a>
          <a href="/contact" className="text-sm font-medium text-neutral-600 transition-colors hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400">تواصل معنا</a>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleDark}
            className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            {dark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
          </button>

          <a href="/login" className="rounded-lg border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
            دخول
          </a>
          <a href="/register" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20">
            إنشاء حساب
          </a>
        </div>

        {/* Mobile buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleDark}
            className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            {dark ? <IconSun className="size-5" /> : <IconMoon className="size-5" />}
          </button>
          <button
            className="rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            onClick={() => setOpen(!open)}
          >
            {open ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-neutral-200/60 md:hidden dark:border-neutral-800/60"
          >
            <div className="flex flex-col gap-1 bg-white/95 px-4 py-4 backdrop-blur-xl dark:bg-neutral-950/95">
              <a href="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">الرئيسية</a>
              <a href="#why-us" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">لماذا نحن</a>
              <a href="/faq" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">الأسئلة الشائعة</a>
              <a href="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">تواصل معنا</a>

              <div className="mt-2 border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
                <div className="flex gap-2">
                  <a href="/login" className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300">
                    دخول
                  </a>
                  <a href="/register" className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                    إنشاء حساب
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
