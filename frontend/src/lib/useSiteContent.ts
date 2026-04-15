"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

type SiteContent = Record<string, Record<string, string>>;

const defaults: SiteContent = {
  contact: {
    whatsapp_phone: "966563214000",
    support_phone: "0563214000",
  },
  pricing: {
    residential_price: "249",
    residential_old_price: "549",
    commercial_price: "349",
    commercial_old_price: "749",
  },
  hero: {
    badge_text: "عقدك الموثق من شبكة إيجار خلال 25 دقيقة",
    promise_minutes: "25",
  },
};

let cached: SiteContent | null = null;
let pending: Promise<SiteContent> | null = null;

async function fetchContent(): Promise<SiteContent> {
  if (cached) return cached;
  if (pending) return pending;

  pending = api
    .get("public-content")
    .then((r) => {
      const data = r.data ?? r ?? {};
      // Merge with defaults so missing keys still work
      const merged: SiteContent = { ...defaults };
      for (const group in data) {
        merged[group] = { ...defaults[group], ...data[group] };
      }
      cached = merged;
      return merged;
    })
    .catch(() => {
      cached = defaults;
      return defaults;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(cached ?? defaults);

  useEffect(() => {
    if (cached) return;
    fetchContent().then(setContent);
  }, []);

  return content;
}
