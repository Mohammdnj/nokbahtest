"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "./api";

export interface FeedItem {
  related_id: number;
  title: string;
  body: string;
  status: string;
  created_at: string;
  kind: "new_contract" | "status_change";
  ts: number;
}

interface FeedResponse {
  items: FeedItem[];
  latest_ts: number;
  unread_count: number;
}

interface UseRealtimeFeedOptions {
  pollMs?: number;
  enabled?: boolean;
  onNew?: (items: FeedItem[]) => void;
}

/**
 * Polls /api/notifications?action=feed&since=X every `pollMs` ms.
 * Maintains a local list of items and calls onNew with brand-new ones.
 */
export function useRealtimeFeed({
  pollMs = 8000,
  enabled = true,
  onNew,
}: UseRealtimeFeedOptions = {}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [bootstrapping, setBootstrapping] = useState(true);
  const sinceRef = useRef<number>(Math.floor(Date.now() / 1000) - 3600); // last hour on first load
  const lastSeenRef = useRef<number>(Math.floor(Date.now() / 1000));

  const tick = useCallback(async () => {
    try {
      const res = await api.get(`notifications?action=feed&since=${sinceRef.current}`);
      const body = (res.data ?? res) as FeedResponse;
      if (body.items && body.items.length > 0) {
        // Merge: newest first, dedupe by related_id+kind+ts
        setItems((prev) => {
          const merged = [...body.items, ...prev];
          const seen = new Set<string>();
          const out: FeedItem[] = [];
          for (const it of merged) {
            const k = `${it.kind}-${it.related_id}-${it.ts}`;
            if (!seen.has(k)) {
              seen.add(k);
              out.push(it);
            }
          }
          return out.slice(0, 50);
        });

        // Notify caller about items strictly newer than last seen
        if (!bootstrapping && onNew) {
          const fresh = body.items.filter((i) => i.ts > lastSeenRef.current);
          if (fresh.length > 0) onNew(fresh);
        }

        sinceRef.current = body.latest_ts;
      }
    } catch {
      // Silent fail — don't spam errors
    } finally {
      setBootstrapping(false);
    }
  }, [bootstrapping, onNew]);

  useEffect(() => {
    if (!enabled) return;
    tick();
    const id = setInterval(tick, pollMs);
    return () => clearInterval(id);
  }, [enabled, pollMs, tick]);

  // Recompute unread when items change
  useEffect(() => {
    setUnread(items.filter((i) => i.ts > lastSeenRef.current).length);
  }, [items]);

  const markAllRead = useCallback(() => {
    lastSeenRef.current = Math.floor(Date.now() / 1000);
    setUnread(0);
  }, []);

  return { items, unread, markAllRead };
}

/**
 * Plays a short success "ding" using the Web Audio API.
 * No external file needed — just two stacked sine tones.
 */
export function playNotificationSound() {
  try {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new AC();
    const playTone = (freq: number, start: number, duration: number, gain = 0.15) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    // Two-tone "ding" — happy + clear
    playTone(880, 0, 0.18); // A5
    playTone(1318, 0.08, 0.22); // E6
    setTimeout(() => ctx.close(), 600);
  } catch {
    // Audio context blocked or not available
  }
}
