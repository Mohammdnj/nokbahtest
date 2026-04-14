"use client";
import React from "react";
import { IconBrandWhatsapp } from "@tabler/icons-react";

export default function WhatsAppFooter() {
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <a
        href="https://wa.me/966563214000?text=أرغب%20في%20إنشاء%20عقد"
        target="_blank"
        rel="noopener noreferrer"
        className="flex size-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-all hover:scale-105"
      >
        <IconBrandWhatsapp className="size-5" />
      </a>
      <span className="text-xs text-neutral-500 md:text-sm dark:text-neutral-400">
        إنشاء عقد من خلال واتساب أو للمساعدة
      </span>
    </div>
  );
}
