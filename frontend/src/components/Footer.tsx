"use client";
import React from "react";
import { IconBrandWhatsapp, IconBrandX, IconBrandInstagram, IconMail } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200/60 bg-neutral-50 dark:border-neutral-800/60 dark:bg-neutral-950" dir="rtl">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <img src="/logolight.png" alt="النخبة" className="h-10 dark:hidden" />
              <img src="/logodark.png" alt="النخبة" className="hidden h-10 dark:block" />
            </div>
            <p className="text-xs leading-relaxed text-neutral-500 md:text-sm dark:text-neutral-400">
              منصتك الموثوقة لإنشاء عقود الإيجار الإلكترونية المعتمدة من شبكة إيجار
              بسرعة واحترافية من أي مكان في المملكة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold text-neutral-900 md:mb-4 md:text-sm dark:text-white">روابط سريعة</h4>
            <ul className="space-y-2 text-xs text-neutral-500 md:text-sm dark:text-neutral-400">
              <li><a href="/" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">الرئيسية</a></li>
              <li><a href="#why-us" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">لماذا نحن</a></li>
              <li><a href="/login" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">تسجيل الدخول</a></li>
              <li><a href="/register" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">إنشاء حساب</a></li>
              <li><a href="/faq" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">الأسئلة الشائعة</a></li>
              <li><a href="/terms" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">الشروط والأحكام</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-3 text-xs font-semibold text-neutral-900 md:mb-4 md:text-sm dark:text-white">خدماتنا</h4>
            <ul className="space-y-2 text-xs text-neutral-500 md:text-sm dark:text-neutral-400">
              <li>عقد إيجار سكني</li>
              <li>عقد إيجار تجاري</li>
              <li>توثيق العقود</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-3 text-xs font-semibold text-neutral-900 md:mb-4 md:text-sm dark:text-white">تواصل معنا</h4>
            <div className="flex gap-2">
              {[
                { icon: IconBrandWhatsapp, href: "#" },
                { icon: IconBrandX, href: "#" },
                { icon: IconBrandInstagram, href: "#" },
                { icon: IconMail, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="rounded-lg bg-white p-2 text-neutral-500 shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                >
                  <Icon className="size-4 md:size-5" />
                </a>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-500 md:mt-4 md:text-sm dark:text-neutral-400">
              متاحين من السبت إلى الخميس
              <br />
              من 9 صباحاً حتى 11 مساءً
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200/60 pt-5 text-center text-[10px] text-neutral-400 md:mt-10 md:pt-6 md:text-sm dark:border-neutral-800/60">
          <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} النخبة — عقود إيجار إلكترونية موثقة</p>
        </div>
      </div>
    </footer>
  );
}
