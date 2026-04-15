"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { IconBell, IconFileDescription, IconRefresh, IconCheck } from "@tabler/icons-react";
import { useRealtimeFeed, playNotificationSound, type FeedItem } from "@/lib/useRealtimeFeed";
import { cn } from "@/lib/utils";

export default function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { items, unread, markAllRead } = useRealtimeFeed({
    pollMs: 8000,
    onNew: (fresh) => {
      if (fresh.some((i) => i.kind === "new_contract")) {
        playNotificationSound();
      }
    },
  });

  // Click outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) markAllRead();
  };

  const handleItemClick = (item: FeedItem) => {
    setOpen(false);
    router.push(`/admin/contracts/`);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        aria-label="الإشعارات"
      >
        <IconBell className="size-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-[320px] overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-2xl sm:w-[380px] dark:border-neutral-800/60 dark:bg-neutral-900"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">الإشعارات</h3>
                <p className="text-[10px] text-neutral-400">
                  {items.length > 0 ? `${items.length} إشعار` : "لا توجد إشعارات"}
                </p>
              </div>
              {items.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400"
                >
                  <IconCheck className="size-3" />
                  تعليم كمقروء
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                  <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                    <IconBell className="size-6" />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    لا توجد إشعارات حالياً
                  </p>
                  <p className="mt-1 text-[10px] text-neutral-400">سيتم تنبيهك فور وصول طلب جديد</p>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {items.map((item, idx) => (
                    <NotificationRow key={`${item.kind}-${item.related_id}-${item.ts}`} item={item} onClick={() => handleItemClick(item)} delay={idx * 0.02} />
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-neutral-100 bg-neutral-50/50 px-5 py-3 text-center dark:border-neutral-800 dark:bg-neutral-800/30">
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/admin/contracts/");
                  }}
                  className="text-xs font-bold text-[#0b7a5a] hover:underline dark:text-emerald-400"
                >
                  عرض جميع العقود
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationRow({
  item,
  onClick,
  delay,
}: {
  item: FeedItem;
  onClick: () => void;
  delay: number;
}) {
  const isNew = item.kind === "new_contract";
  const time = new Date(item.created_at).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.li
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <button
        onClick={onClick}
        className="flex w-full items-start gap-3 px-5 py-3 text-right transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      >
        <div
          className={cn(
            "flex size-9 flex-shrink-0 items-center justify-center rounded-xl",
            isNew
              ? "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          )}
        >
          {isNew ? <IconFileDescription className="size-4" /> : <IconRefresh className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {item.title}
          </p>
          <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">{item.body}</p>
        </div>
        <span className="flex-shrink-0 text-[10px] text-neutral-400" dir="ltr">{time}</span>
      </button>
    </motion.li>
  );
}
