"use client";

import { useEffect, useRef, useCallback } from "react";

interface SSEOptions {
  onNewContract?: (data: unknown) => void;
  onContractUpdate?: (data: unknown) => void;
  onConnected?: () => void;
  onError?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function useSSE(options: SSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastIdRef = useRef(0);
  const lastLogIdRef = useRef(0);

  const connect = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // EventSource doesn't support headers, so pass token as query param
    const url = `${API_URL}/sse?token=${encodeURIComponent(token)}&last_id=${lastIdRef.current}&last_log_id=${lastLogIdRef.current}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      options.onConnected?.();
    });

    es.addEventListener("new_contract", (e) => {
      const data = JSON.parse(e.data);
      lastIdRef.current = parseInt(e.lastEventId) || lastIdRef.current;
      options.onNewContract?.(data);
    });

    es.addEventListener("contract_update", (e) => {
      const data = JSON.parse(e.data);
      lastLogIdRef.current = parseInt(e.lastEventId) || lastLogIdRef.current;
      options.onContractUpdate?.(data);
    });

    es.addEventListener("reconnect", () => {
      es.close();
      // Reconnect after a short delay
      setTimeout(connect, 2000);
    });

    es.onerror = () => {
      options.onError?.();
      es.close();
      // Auto-reconnect after 5 seconds
      setTimeout(connect, 5000);
    };
  }, [options]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  return { disconnect };
}
