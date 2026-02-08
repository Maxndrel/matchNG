
import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getPendingActions, removePendingAction, saveUser, getActiveUser } from '../services/storage';

const SyncIndicator: React.FC = () => {
  // SSR-safe default state
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    // Set real status on mount
    setIsOnline(navigator.onLine);

    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateQueue = () => {
      setPendingCount(getPendingActions().length);
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
    const actions = [...getPendingActions()];
    
    for (const action of actions) {
      try {
        await new Promise(r => setTimeout(r, 1000));
        const user = getActiveUser();
        if (!user) {
          removePendingAction(action.id);
          continue;
        }

        if (action.type === 'APPLY') {
          const jobId = action.payload.jobId;
          if (!user.appliedJobIds.includes(jobId)) {
            user.appliedJobIds.push(jobId);
            saveUser(user);
          }
        } else if (action.type === 'SAVE_JOB') {
          const jobId = action.payload.jobId;
          const isSaved = user.savedJobIds.includes(jobId);
          if (isSaved) {
             user.savedJobIds = user.savedJobIds.filter(id => id !== jobId);
          } else {
             user.savedJobIds.push(jobId);
          }
          saveUser(user);
        }
        removePendingAction(action.id);
      } catch (err) {
        console.error('Sync error:', err);
      }
    }
    setIsSyncing(false);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all">
      {isOnline ? (
        <>
          {isSyncing ? (
            <div className="flex items-center gap-2 text-emerald-600 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Syncing {pendingCount} actions</span>
            </div>
          ) : pendingCount > 0 ? (
            <div className="flex items-center gap-2 text-blue-600">
              <Cloud className="w-3 h-3" />
              <span>{pendingCount} Queued</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 opacity-60">
              <CheckCircle2 className="w-3 h-3" />
              <span>Live Engine</span>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
          <CloudOff className="w-3 h-3" />
          <span>Offline Mode</span>
        </div>
      )}
    </div>
  );
};

export default SyncIndicator;
