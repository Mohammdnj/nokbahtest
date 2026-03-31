"use client";
import React, { useState, useEffect } from "react";
import { IconBrandWhatsapp, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

export default function WhatsAppButton() {
  const [tooltip, setTooltip] = useState(true);
  const phone = "966563214000";
  const message = encodeURIComponent("السلام عليكم، أبغى أوثّق عقد إيجار");

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100) setTooltip(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* WhatsApp button - always bottom right */}
      <motion.a
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-shadow hover:shadow-xl hover:shadow-[#25D366]/40"
      >
        <IconBrandWhatsapp className="size-7" />
        <span className="absolute -top-0.5 -right-0.5 flex size-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex size-3.5 rounded-full bg-red-500"></span>
        </span>
      </motion.a>

      {/* Tooltip - to the left of button */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.2, delay: 1.5 }}
            className="fixed bottom-8 right-24 z-50 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-lg ring-1 ring-neutral-200/60 dark:bg-neutral-800 dark:ring-neutral-700/60"
            dir="rtl"
          >
            <p className="whitespace-nowrap text-xs font-medium text-neutral-700 md:text-sm dark:text-neutral-200">
              تحتاج مساعدة؟ كلمنا واتساب
            </p>
            <button
              onClick={() => setTooltip(false)}
              className="rounded-full p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
            >
              <IconX className="size-3.5" />
            </button>
            {/* Arrow pointing right */}
            <div className="absolute -right-2 bottom-3 size-4 rotate-45 bg-white ring-1 ring-neutral-200/60 dark:bg-neutral-800 dark:ring-neutral-700/60" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
