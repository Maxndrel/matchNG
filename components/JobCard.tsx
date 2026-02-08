
import React, { useState, useEffect, memo, useCallback } from 'react';
import { MatchResult, ApplicationStatus } from '../types';
import { MapPin, Globe, Star, CheckCircle2, Loader2, Cloud, RefreshCw } from 'lucide-react';
import { addPendingAction, saveApplication, getActiveUser } from '../services/storage';

interface JobCardProps {
  match: MatchResult;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isApplied?: boolean;
  isSaved?: boolean;
}

const JobCard: React.FC<JobCardProps> = memo(({ match, onApply, onSave, isApplied, isSaved }) => {
  const { job, scoreSkill, scoreLocation, scoreTrend, scoreFinal } = match;
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Default to true for SSR safety; will correct on mount
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleStatus = () => setIsOnline(navigator.onLine);
      window.addEventListener('online', handleStatus);
      window.addEventListener('offline', handleStatus);
      return () => {
        window.removeEventListener('online', handleStatus);
        window.removeEventListener('offline', handleStatus);
      };
    }
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleApplyClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isApplied || isProcessing) return;

    const user = getActiveUser();
    if (!user) return;

    if (!isOnline) {
      addPendingAction({ 
        type: 'APPLY', 
        payload: { 
          jobId: job.id, 
          employerId: job.employerId,
          seekerName: user.fullName,
          jobTitle: job.title
        } 
      });
      setFeedback('Offline: Application Queued');
      onApply(job.id);
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    saveApplication({
      id: `app-${Date.now()}`,
      jobId: job.id,
      seekerId: user.id,
      employerId: job.employerId,
      status: ApplicationStatus.PENDING,
      timestamp: new Date().toISOString(),
      seekerName: user.fullName,
      jobTitle: job.title
    });

    onApply(job.id);
    setFeedback('Application Sent!');
    setIsProcessing(false);
  }, [isApplied, isProcessing, job, onApply, isOnline]);

  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOnline) {
      addPendingAction({ type: 'SAVE_JOB', payload: { jobId: job.id } });
      setFeedback('Offline: Bookmark Queued');
      onSave(job.id);
      return;
    }
    onSave(job.id);
    setFeedback(!isSaved ? 'Job Bookmarked!' : 'Removed Bookmark');
  }, [job.id, onSave, isSaved, isOnline]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 overflow-hidden flex flex-col group h-full relative">
      {feedback && (
        <div className="absolute top-4 left-4 right-4 z-20 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-gray-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
            {!isOnline ? <Cloud className="w-4 h-4 text-blue-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span className="text-[11px] font-black uppercase tracking-tight">{feedback}</span>
          </div>
        </div>
      )}

      <div className="p-8 flex-grow space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{job.industry}</span>
            <h3 className="text-2xl font-black text-gray-900 leading-tight pt-2 group-hover:text-emerald-700 transition-colors">{job.title}</h3>
            <p className="text-gray-500 font-bold">{job.employerName}</p>
          </div>
          <div className={`flex-shrink-0 w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center border-4 transition-all ${scoreFinal > 0.8 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}>
            <span className="text-[10px] font-black opacity-40 uppercase">Match</span>
            <span className="text-3xl font-black text-gray-900">{(scoreFinal * 100).toFixed(0)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
             <MapPin className="w-3.5 h-3.5 text-gray-400" />
             <span className="text-xs font-bold text-gray-600">{job.location.city}</span>
          </div>
          {job.isRemote && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-blue-700 uppercase tracking-tighter text-[10px] font-black">Remote</div>
          )}
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 font-medium">{job.description}</p>
      </div>
      
      <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex gap-3">
        <button 
          onClick={handleApplyClick}
          disabled={isApplied || isProcessing}
          className={`flex-grow py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.96] shadow-xl ${
            isApplied 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200' 
              : isProcessing
                ? 'bg-emerald-500 text-white cursor-wait opacity-80'
                : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700'
          }`}
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : isApplied ? 'Applied' : 'Apply Now'}
        </button>
        <button 
          onClick={handleSaveClick}
          className={`px-5 py-4 bg-white border rounded-2xl transition-all ${isSaved ? 'text-yellow-500 border-yellow-200 bg-yellow-50' : 'text-gray-300 border-gray-200'}`}
        >
          <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
});

export default JobCard;
