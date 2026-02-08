
import React, { useState, useEffect, useRef } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { getPendingActions, removePendingAction, saveUser, getActiveUser } from '../services/storage.ts';

const SyncIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showLiveStatus, setShowLiveStatus] = useState(false);
  const prevOnlineRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    setIsOnline(navigator.onLine);
    prevOnlineRef.current = navigator.onLine;

    const updateStatus = () => {
      const currentOnline = navigator.onLine;
      // If we just went from offline to online
      if (!prevOnlineRef.current && currentOnline) {
        setShowLiveStatus(true);
        setTimeout(() => setShowLiveStatus(false), 3000);
      }
      setIsOnline(currentOnline);
      prevOnlineRef.current = currentOnline;
    };

    const updateQueue = async () => {
      const actions = await getPendingActions();
      setPendingCount(actions.length);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    window.addEventListener('storage-sync', updateQueue);

    updateQueue();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('storage-sync', updateQueue);
    };
  }, []);

  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      handleSync();
    }
  }, [isOnline, pendingCount, isSyncing]);

  const handleSync = async () => {
    setIsSyncing(true);
    const actions = await getPendingActions();
    
    for (const action of actions) {
      try {
        await new Promise(r => setTimeout(r, 800));
        const user = getActiveUser();
        if (!user) {
          await removePendingAction(action.id);
          continue;
        }

        if (action.type === 'APPLY') {
          const jobId = action.payload.jobId;
          if (!user.appliedJobIds.includes(jobId)) {
            user.appliedJobIds.push(jobId);
            await saveUser(user);
          }
        } else if (action.type === 'SAVE_JOB') {
          const jobId = action.payload.jobId;
          const isSaved = user.savedJobIds.includes(jobId);
          if (isSaved) {
             user.savedJobIds = user.savedJobIds.filter(id => id !== jobId);
          } else {
             user.savedJobIds.push(jobId);
          }
          await saveUser(user);
        }
        await removePendingAction(action.id);
      } catch (err) {
        console.error('Sync error:', err);
      }
    }
    setIsSyncing(false);
  };

  // If online, synced, and not showing the temporary "Back Online" message, render nothing
  if (isOnline && pendingCount === 0 && !isSyncing && !showLiveStatus) {
    return null;
  }

  return (
    <div className="relative">
      {!isOnline ? (
        // Offline Pop-up (Toast-style)
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
              <WifiOff className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-widest leading-none">Offline Mode</p>
              <p className="text-[9px] text-gray-400 font-bold mt-1">Actions will sync when back online</p>
            </div>
          </div>
        </div>
      ) : showLiveStatus ? (
        // Temporary "Live Engine" Pop-up when reconnecting
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-widest leading-none">Live Engine Active</p>
              <p className="text-[9px] text-emerald-100 font-bold mt-1">Connection restored & synced</p>
            </div>
          </div>
        </div>
      ) : (
        // Inline indicator for syncing/pending within the Navbar flow
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 bg-white shadow-sm transition-all animate-in fade-in zoom-in-95">
          {isSyncing ? (
            <div className="flex items-center gap-2 text-emerald-600 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Syncing {pendingCount} actions</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-600">
              <Cloud className="w-3 h-3" />
              <span>{pendingCount} Queued</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncIndicator;
