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
 *
 * Stability notes:
 * - The `tick` function is built with refs so it never changes identity, even
 *   if the caller passes a new `onNew` closure on every render.
 * - The polling effect runs exactly once per mount and only depends on enabled
 *   + pollMs (primitive values), so unrelated parent re-renders cannot restart
 *   the interval.
 */
export function useRealtimeFeed({
  pollMs = 8000,
  enabled = true,
  onNew,
}: UseRealtimeFeedOptions = {}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [unread, setUnread] = useState(0);

  // Mutable refs so the tick function never has to be re-created
  const sinceRef = useRef<number>(Math.floor(Date.now() / 1000) - 3600);
  const lastSeenRef = useRef<number>(Math.floor(Date.now() / 1000));
  const bootstrappingRef = useRef(true);
  const onNewRef = useRef(onNew);

  // Keep onNew up-to-date without changing the tick identity
  useEffect(() => {
    onNewRef.current = onNew;
  }, [onNew]);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const tick = async () => {
      try {
        const res = await api.get(`notifications?action=feed&since=${sinceRef.current}`);
        const body = (res?.data ?? res) as FeedResponse;
        if (!mounted || !body?.items) return;

        if (body.items.length > 0) {
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

          if (!bootstrappingRef.current && onNewRef.current) {
            const fresh = body.items.filter((i) => i.ts > lastSeenRef.current);
            if (fresh.length > 0) onNewRef.current(fresh);
          }

          sinceRef.current = body.latest_ts;
        }
      } catch {
        // Silent fail
      } finally {
        bootstrappingRef.current = false;
      }
    };

    // First run
    tick();
    const id = setInterval(tick, pollMs);

    return () => {
      mounted = false;
      clearInterval(id);
    };
    // We deliberately depend ONLY on primitives so parent re-renders don't
    // restart the polling loop.
  }, [enabled, pollMs]);

  // Recompute unread whenever items change
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
 */
export function playNotificationSound() {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    playTone(880, 0, 0.18);
    playTone(1318, 0.08, 0.22);
    setTimeout(() => ctx.close(), 600);
  } catch {
    // Audio blocked
  }
}
