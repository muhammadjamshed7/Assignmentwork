"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */

import * as React from "react";

import { requireSupabase, getErrorMessage } from "@/lib/data/client";

type QueryState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useSupabaseQuery<T>(
  load: () => Promise<T>,
  initialData: T,
  realtimeTables: string[] = [],
  reloadKey = ""
): QueryState<T> {
  const [data, setData] = React.useState<T>(initialData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const loadRef = React.useRef(load);
  const mountedRef = React.useRef(true);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeKey = Array.from(new Set(realtimeTables.filter(Boolean))).join("|");

  loadRef.current = load;

  const refresh = React.useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loadRef.current();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    void refresh();
  }, [refresh, reloadKey]);

  React.useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const tables = realtimeKey ? realtimeKey.split("|") : [];
    if (tables.length === 0) return;

    let client;
    try {
      client = requireSupabase();
    } catch (err) {
      setError(getErrorMessage(err));
      return;
    }

    const channel = client.channel(`realtime:${realtimeKey}:${Math.random().toString(36).slice(2)}`);

    tables.forEach(table => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          debounceTimerRef.current = null;
          void refresh();
        }, 500);
      });
    });

    channel.subscribe();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      void client.removeChannel(channel);
    };
  }, [refresh, realtimeKey]);

  return { data, loading, error, refresh };
}

export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-slate-700 p-8 text-center text-sm text-gray-400 dark:text-slate-500">
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
      <div className="font-medium">Unable to load data</div>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <button type="button" className="mt-3 text-sm font-semibold underline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
