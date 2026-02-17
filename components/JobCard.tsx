
"use client";

import React, { useState, useEffect, memo, useCallback } from 'react';
import { MatchResult, ApplicationStatus } from '../types';
import { MapPin, Globe, Star, CheckCircle2, Loader2, Cloud, Zap, Wallet, Award, Clock, XCircle } from 'lucide-react';
import { addPendingAction, saveApplication, getActiveUser } from '../services/storage';

interface JobCardProps {
  match: MatchResult;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isApplied?: boolean;
  isSaved?: boolean;
  applicationStatus?: ApplicationStatus;
}

const JobCard: React.FC<JobCardProps> = memo(({ match, onApply, onSave, isApplied, isSaved, applicationStatus }) => {
  const { job, scoreFinal, scoreSkill } = match;
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getActiveUser());
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

    const currentUser = getActiveUser();
    if (!currentUser) return;

    if (!isOnline) {
      addPendingAction({ 
        type: 'APPLY', 
        payload: { 
          jobId: job.id, 
          employerId: job.employerId,
          seekerName: currentUser.fullName,
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
      seekerId: currentUser.id,
      employerId: job.employerId,
      status: ApplicationStatus.PENDING,
      timestamp: new Date().toISOString(),
      seekerName: currentUser.fullName,
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

  const isPrimarySkillMatch = user?.primarySkill && job.requiredSkills.includes(user.primarySkill);

  const renderStatusBadge = () => {
    if (!applicationStatus) return null;

    switch (applicationStatus) {
      case ApplicationStatus.SHORTLISTED:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full animate-pulse shadow-lg shadow-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Shortlisted</span>
          </div>
        );
      case ApplicationStatus.REJECTED:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Rejected</span>
          </div>
        );
      case ApplicationStatus.HIRED:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200">
            <Award className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Hired!</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Pending Review</span>
          </div>
        );
    }
  };

  return (
    <div className={`bg-white rounded-[2.5rem] border ${isPrimarySkillMatch ? 'border-emerald-200 ring-4 ring-emerald-500/5' : 'border-gray-100'} shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group h-full relative`}>
      {feedback && (
        <div className="absolute top-4 left-4 right-4 z-20 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-gray-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
            {!isOnline ? <Cloud className="w-4 h-4 text-blue-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span className="text-[11px] font-black uppercase tracking-tight">{feedback}</span>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 flex-grow space-y-5">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{job.industry}</span>
              {renderStatusBadge()}
              {isPrimarySkillMatch && !applicationStatus && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white bg-emerald-600 px-2.5 py-1 rounded-full shadow-sm">
                  <Award className="w-3 h-3" /> Expertise Match
                </span>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight pt-2 truncate group-hover:text-emerald-700 transition-colors">{job.title}</h3>
            <p className="text-gray-500 font-bold text-sm truncate">{job.employerName}</p>
          </div>
          <div className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center border-4 transition-all ${scoreFinal > 0.8 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}>
            <span className="text-[8px] md:text-[10px] font-black opacity-40 uppercase tracking-widest leading-none mb-1">Match</span>
            <span className="text-xl md:text-3xl font-black text-gray-900">{(scoreFinal * 100).toFixed(0)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
             <MapPin className="w-3.5 h-3.5 text-gray-400" />
             <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">{job.location.city}</span>
          </div>
          {job.salaryRange && (
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-700">
               <Wallet className="w-3.5 h-3.5" />
               <span className="text-[11px] font-black uppercase tracking-tight">{job.salaryRange}</span>
            </div>
          )}
          {job.isRemote && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-blue-700 uppercase tracking-tighter text-[9px] font-black">Remote</div>
          )}
        </div>

        <p className="text-gray-500 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-3 font-medium">{job.description}</p>
      </div>
      
      <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex gap-3">
        <button 
          onClick={handleApplyClick}
          disabled={isApplied || isProcessing}
          className={`flex-grow h-14 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.96] shadow-lg ${
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
          aria-label={isSaved ? "Remove Bookmark" : "Save Job"}
          className={`w-14 h-14 flex items-center justify-center bg-white border rounded-2xl transition-all active:scale-[0.96] ${isSaved ? 'text-yellow-500 border-yellow-200 bg-yellow-50' : 'text-gray-300 border-gray-200'}`}
        >
          <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
});

export default JobCard;
