
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface LocalStoreMeta {
  isDirty: boolean;
  lastSavedAt: number | null;
  version: number;
}

/**
 * useClientLocalStore
 * Production-ready hook for persistent local state.
 * Features: Lazy init, Debouncing, Cross-tab sync, JSON Safety.
 */
export function useClientLocalStore<T>(
  key: string,
  defaultValue: T,
  options: { debounceMs?: number; version?: number } = {}
) {
  const { debounceMs = 1000, version = 1 } = options;
  const [state, setState] = useState<T>(defaultValue);
  const [meta, setMeta] = useState<LocalStoreMeta>({
    isDirty: false,
    lastSavedAt: null,
    version
  });

  const isInitialized = useRef(false);
  const debounceTimer = useRef<number | null>(null);

  const fullKey = `matchNG:v1:drafts:${key}`;

  // 1. Lazy Initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(fullKey);
      if (raw) {
        const envelope = JSON.parse(raw);
        // Version migration check
        if (envelope.version === version) {
          setState(envelope.data);
          setMeta(m => ({ ...m, lastSavedAt: envelope.timestamp }));
        }
      }
    } catch (e) {
      console.error(`Failed to hydrate local store [${key}]`, e);
    } finally {
      isInitialized.current = true;
    }
  }, [fullKey, version]);

  // 2. Cross-tab Sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === fullKey && e.newValue) {
        try {
          const envelope = JSON.parse(e.newValue);
          setState(envelope.data);
          setMeta(m => ({ ...m, lastSavedAt: envelope.timestamp, isDirty: false }));
        } catch (err) {
          console.error("Storage sync failed", err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [fullKey]);

  // 3. Debounced Persistent Write
  const setPersistentState = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as any)(prev) : value;
      
      setMeta(m => ({ ...m, isDirty: true }));

      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      
      debounceTimer.current = window.setTimeout(() => {
        try {
          const timestamp = Date.now();
          const envelope = { data: next, version, timestamp };
          localStorage.setItem(fullKey, JSON.stringify(envelope));
          setMeta(m => ({ ...m, isDirty: false, lastSavedAt: timestamp }));
        } catch (err) {
          console.error(`Failed to write local store [${key}]`, err);
        }
      }, debounceMs);

      return next;
    });
  }, [fullKey, debounceMs, version]);

  return [state, setPersistentState, meta] as const;
}
