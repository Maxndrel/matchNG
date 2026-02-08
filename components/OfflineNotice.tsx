
"use client";

import React from 'react';
import { CloudOff, RefreshCw, CheckCircle2, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';

interface OfflineNoticeProps {
  onRetry: () => void;
  onContinue: () => void;
  isChecking?: boolean;
}

const OfflineNotice: React.FC<OfflineNoticeProps> = ({ onRetry, onContinue, isChecking }) => {
  return (
    <div className="w-full animate-in fade-in slide-in-from-top-4 duration-500" role="alert" aria-live="assertive">
      <div className="bg-white rounded-[2.5rem] border-2 border-amber-100 shadow-2xl shadow-amber-900/5 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-20 h-20 rounded-[2rem] bg-amber-50 flex items-center justify-center flex-shrink-0 animate-pulse">
              <CloudOff className="w-10 h-10 text-amber-600" />
            </div>
            
            <div className="space-y-4 flex-grow">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Live Job Matching Is Temporarily Offline
              </h2>
              <p className="text-gray-500 font-medium text-lg leading-relaxed">
                You can still browse saved jobs, update your profile, and apply. 
                New matches will be generated automatically once you’re back online.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                <button 
                  onClick={onRetry}
                  disabled={isChecking}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xl shadow-emerald-100 disabled:opacity-50"
                >
                  {isChecking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Retry Connection
                </button>
                <button 
                  onClick={onContinue}
                  className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Continue Offline
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: CheckCircle2, text: "Save interesting jobs" },
              { icon: CheckCircle2, text: "Update profile details" },
              { icon: CheckCircle2, text: "Queue new applications" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <item.icon className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NON-REMOTE WORK DISCLAIMER */}
        <div className="bg-amber-50/50 border-t border-amber-100 p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Platform Regulatory Notice
          </div>
          <p className="text-amber-800/70 text-[11px] font-bold leading-snug max-w-lg">
            Important: This platform connects users to on-site and location-based jobs. 
            Remote work opportunities are not supported.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineNotice;
