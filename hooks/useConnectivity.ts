
"use client";

import { useState, useEffect, useCallback } from 'react';

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkHeartbeat = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    // navigator.onLine is the first line of defense
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    setIsChecking(true);
    try {
      // Small timeout-enabled fetch to a reliable endpoint (or your own health check)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors', 
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      setIsOnline(true);
    } catch (e) {
      // If fetch fails even though navigator says we are online, we are likely behind a captive portal or high latency
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => checkHeartbeat();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkHeartbeat();

    // Background polling every 30s to detect "Zombie" connections
    const interval = setInterval(checkHeartbeat, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkHeartbeat]);

  return { isOnline, isChecking, retry: checkHeartbeat };
}
