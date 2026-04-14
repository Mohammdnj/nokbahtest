"use client";
import React from "react";

export default function HeroTagline() {
  return (
    <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
      <svg className="h-3 w-12 text-[#0b7a5a]/40 md:w-20" viewBox="0 0 80 12" fill="none">
        <path
          d="M1 6 Q 20 0, 40 6 T 79 6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <h2 className="text-center text-sm font-bold text-[#0b7a5a] md:text-base">
        رحلتك الإيجارية أصبحت أسهل
      </h2>
      <svg className="h-3 w-12 text-[#0b7a5a]/40 md:w-20" viewBox="0 0 80 12" fill="none">
        <path
          d="M1 6 Q 20 12, 40 6 T 79 6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
