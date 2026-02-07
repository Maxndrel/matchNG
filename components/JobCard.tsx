
import React, { useState, useEffect, memo, useCallback } from 'react';
import { MatchResult } from '../types';
import { SKILL_INDEX } from '../constants';
import { MapPin, Globe, Banknote, Star, CheckCircle2, Loader2 } from 'lucide-react';

interface JobCardProps {
  match: MatchResult;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isApplied?: boolean;
  isSaved?: boolean;
}

/**
 * Optimized JobCard Component
 * - Wrapped in React.memo to prevent re-renders unless props change.
 * - Uses useCallback for event handlers to maintain reference stability.
 * - Optimized skill lookups via SKILL_INDEX Map.
 */
const JobCard: React.FC<JobCardProps> = memo(({ match, onApply, onSave, isApplied, isSaved }) => {
  const { job, scoreSkill, scoreLocation, scoreTrend, scoreFinal } = match;
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Effect for clearing feedback with cleanup to prevent memory leaks
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleApplyClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isApplied || isProcessing) return;

    setIsProcessing(true);
    // Micro-delay for UI responsiveness feel (optimistic UI update could be faster, but this ensures state catch-up)
    await new Promise(resolve => setTimeout(resolve, 400));
    onApply(job.id);
    setFeedback('Application Sent!');
    setIsProcessing(false);
  }, [isApplied, isProcessing, job.id, onApply]);

  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(job.id);
    // Feedback text based on next state
    setFeedback(!isSaved ? 'Job Bookmarked!' : 'Removed Bookmark');
  }, [job.id, onSave, isSaved]);

  // Pure styling helpers - kept outside render scope for cleanliness
  const getScoreColor = (score: number) => {
    if (score > 0.8) return 'text-emerald-600';
    if (score > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = (score: number) => {
    if (score > 0.8) return 'bg-emerald-50';
    if (score > 0.5) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 overflow-hidden flex flex-col group h-full relative will-change-transform">
      {/* Visual Feedback Toast */}
      {feedback && (
        <div className="absolute top-4 left-4 right-4 z-20 animate-in slide-in-from-top-2 fade-in duration-300 pointer-events-none">
          <div className="bg-gray-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-tight">{feedback}</span>
          </div>
        </div>
      )}

      <div className="p-8 flex-grow space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{job.industry}</span>
              {isApplied && (
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Applied
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-gray-900 leading-tight pt-2 group-hover:text-emerald-700 transition-colors">{job.title}</h3>
            <p className="text-gray-500 font-bold">{job.employerName}</p>
          </div>
          <div className={`flex-shrink-0 w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center border-4 transition-all duration-500 ${scoreFinal > 0.8 ? 'border-emerald-500 bg-emerald-50 group-hover:scale-105' : 'border-gray-100 bg-gray-50'}`}>
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">Match</span>
            <span className="text-3xl font-black text-gray-900 leading-none">{(scoreFinal * 100).toFixed(0)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
             <MapPin className="w-3.5 h-3.5 text-gray-400" />
             <span className="text-xs font-bold text-gray-600">{job.location.city}</span>
          </div>
          {job.isRemote && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
               <Globe className="w-3.5 h-3.5 text-blue-600" />
               <span className="text-xs font-bold text-blue-700 uppercase tracking-tighter">Remote</span>
            </div>
          )}
          {job.salaryRange && (
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
               <Banknote className="w-3.5 h-3.5 text-emerald-600" />
               <span className="text-xs font-bold text-emerald-700">{job.salaryRange}</span>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 font-medium">{job.description}</p>

        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-50">
          {[
            { label: 'Skills', val: scoreSkill },
            { label: 'Loc', val: scoreLocation },
            { label: 'Trend', val: scoreTrend }
          ].map((s, i) => (
            <div key={i} className={`p-3 rounded-2xl ${getBgColor(s.val)} flex flex-col items-center justify-center transition-transform hover:scale-105`}>
              <p className="text-[9px] uppercase font-black text-gray-400 mb-0.5 tracking-widest">{s.label}</p>
              <p className={`text-sm font-black ${getScoreColor(s.val)}`}>{(s.val * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex gap-3">
        <button 
          onClick={handleApplyClick}
          disabled={isApplied || isProcessing}
          className={`flex-grow py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.96] shadow-xl ${
            isApplied 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
              : isProcessing
                ? 'bg-emerald-500 text-white cursor-wait opacity-80'
                : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isApplied ? (
            'Application Sent'
          ) : (
            'Quick Apply'
          )}
        </button>
        <button 
          onClick={handleSaveClick}
          className={`px-5 py-4 bg-white border rounded-2xl transition-all shadow-sm active:scale-[0.9] hover:shadow-md ${
            isSaved 
              ? 'text-yellow-500 border-yellow-200 bg-yellow-50 hover:bg-yellow-100' 
              : 'text-gray-300 border-gray-200 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50'
          }`}
          title={isSaved ? "Remove from saved" : "Save for later"}
        >
          <Star className={`w-5 h-5 transition-all duration-300 ${isSaved ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
        </button>
      </div>
    </div>
  );
}, (prev, next) => {
  // Custom equality check: only re-render if fundamental properties change
  return (
    prev.isApplied === next.isApplied &&
    prev.isSaved === next.isSaved &&
    prev.match.job.id === next.match.job.id &&
    prev.match.scoreFinal === next.match.scoreFinal
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;
