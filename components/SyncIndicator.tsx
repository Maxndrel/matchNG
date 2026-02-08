
"use client";

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

  if (isOnline && pendingCount === 0 && !isSyncing && !showLiveStatus) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 w-full max-w-sm pointer-events-none">
      <div className="pointer-events-auto">
        {!isOnline ? (
          <div className="bg-gray-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
              <WifiOff className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Connection Offline</p>
              <p className="text-[9px] text-gray-400 font-bold mt-1">Actions will queue locally</p>
            </div>
          </div>
        ) : showLiveStatus ? (
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Live Sync Restored</p>
              <p className="text-[9px] text-emerald-100 font-bold mt-1">Matching engine is now active</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-md border border-gray-100 px-4 py-2.5 rounded-full shadow-lg flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 mx-auto w-fit">
            {isSyncing ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Syncing Data...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-blue-600">
                <Cloud className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{pendingCount} Action{pendingCount > 1 ? 's' : ''} Queued</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncIndicator;
