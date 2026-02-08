
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Storage from '../services/storage.ts';

/**
 * usePersistentState
 * A robust hook for keeping React state in sync with localStorage.
 * Handles: Lazy init, Cross-tab sync, Debounced writes, Error recovery.
 */
export function usePersistentState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(defaultValue);
  const isInitialized = useRef(false);
  const debounceTimer = useRef<number | null>(null);

  // 1. Initial hydration (Client-only)
  useEffect(() => {
    const init = async () => {
      const stored = await Storage.getItem<T>(key);
      if (stored !== null) {
        setState(stored);
      }
      isInitialized.current = true;
    };
    init();
  }, [key]);

  // 2. Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // LocalStorage key format is matchNG:v1:[key]
      if (e.key === `matchNG:v1:${key}` && e.newValue) {
        try {
          const envelope = JSON.parse(e.newValue);
          // Only sync if versions match or after migration
          setState(envelope.data);
        } catch (err) {
          console.error("Sync error", err);
        }
      }
    };

    // Also listen to internal custom sync event
    const handleCustomSync = () => {
      Storage.getItem<T>(key).then(val => {
        if (val !== null) setState(val);
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-sync', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-sync', handleCustomSync);
    };
  }, [key]);

  // 3. Debounced write to storage
  const setPersistentState = useCallback((value: T | ((prevState: T) => T)) => {
    setState((current) => {
      const next = typeof value === 'function' ? (value as any)(current) : value;
      
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      
      debounceTimer.current = window.setTimeout(() => {
        Storage.setItem(key, next).catch(err => {
          console.error("Failed to persist state", err);
        });
      }, 300);

      return next;
    });
  }, [key]);

  return [state, setPersistentState] as const;
}
