
"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { UserProfile, Job, MatchResult } from '../../types.ts';
import { getJobs, saveUser } from '../../services/storage.ts';
import { computeMatch } from '../../services/matchingEngine.ts';
import JobCard from '../../components/JobCard.tsx';
import OfflineNotice from '../../components/OfflineNotice.tsx';
import { INDUSTRIES, NIGERIA_STATES } from '../../constants.ts';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { useConnectivity } from '../../hooks/useConnectivity.ts';

interface MatchesProps {
  user: UserProfile;
}

const JOBS_PER_PAGE = 10;

const Matches: React.FC<MatchesProps> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(JOBS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { isOnline, isChecking, retry } = useConnectivity();
  const [forceContinueOffline, setForceContinueOffline] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await getJobs();
    setJobs(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('storage-sync', loadData);
    return () => window.removeEventListener('storage-sync', loadData);
  }, [loadData]);

  const handleApply = async (jobId: string) => {
    if (user.appliedJobIds.includes(jobId)) return;
    const updatedUser = {
      ...user,
      appliedJobIds: [...user.appliedJobIds, jobId]
    };
    await saveUser(updatedUser);
  };

  const handleSave = async (jobId: string) => {
    const isSaved = user.savedJobIds.includes(jobId);
    const updatedUser = {
      ...user,
      savedJobIds: isSaved 
        ? user.savedJobIds.filter(id => id !== jobId) 
        : [...user.savedJobIds, jobId]
    };
    await saveUser(updatedUser);
  };

  const filteredMatches = useMemo(() => {
    if (jobs.length === 0) return [];
    
    return jobs
      .map(job => computeMatch(user, job))
      .filter(match => {
        const { job, scoreFinal } = match;
        const searchStr = (job.title + job.employerName + job.description).toLowerCase();
        if (searchQuery && !searchStr.includes(searchQuery.toLowerCase())) return false;
        if (selectedIndustry && job.industry !== selectedIndustry) return false;
        if (selectedState && job.location.state !== selectedState) return false;
        if (remoteOnly && !job.isRemote) return false;
        if (scoreFinal < minScore / 100) return false;
        return true;
      })
      .sort((a, b) => b.scoreFinal - a.scoreFinal);
  }, [user, jobs, searchQuery, selectedIndustry, selectedState, remoteOnly, minScore]);

  useEffect(() => {
    setVisibleCount(JOBS_PER_PAGE);
  }, [searchQuery, selectedIndustry, selectedState, remoteOnly, minScore]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && visibleCount < filteredMatches.length) {
      setVisibleCount(prev => prev + JOBS_PER_PAGE);
    }
  }, [visibleCount, filteredMatches.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Handle auto-reset of force offline when connection returns
  useEffect(() => {
    if (isOnline) setForceContinueOffline(false);
  }, [isOnline]);

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Career Matches</h1>
          <p className="text-gray-500 font-medium mt-2">
            {!isOnline && !forceContinueOffline 
              ? "Live matching paused due to connectivity." 
              : `Found ${filteredMatches.length} high-probability roles.`}
          </p>
        </div>
      </header>

      {!isOnline && !forceContinueOffline ? (
        <OfflineNotice 
          onRetry={retry} 
          onContinue={() => setForceContinueOffline(true)} 
          isChecking={isChecking} 
        />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search roles, companies, or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-8 py-4 rounded-[1.5rem] font-black border transition-all flex items-center justify-center gap-2 ${
                showFilters 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest">{showFilters ? 'Hide Advanced' : 'Filters'}</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Industry</label>
                <select 
                  value={selectedIndustry}
                  onChange={e => setSelectedIndustry(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                >
                  <option value="">All Industries</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                <select 
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                >
                  <option value="">All of Nigeria</option>
                  {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1 px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min Match Score</label>
                  <span className="text-xs font-black text-emerald-600">{minScore}%</span>
                </div>
                <div className="flex items-center gap-4 h-10 px-2">
                  <input 
                    type="range" 
                    value={minScore} 
                    onChange={e => setMinScore(Number(e.target.value))} 
                    className="accent-emerald-600 flex-grow cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Querying Matching Engine...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900">No matches found</h3>
              <p className="text-gray-400 text-sm font-medium">Try adjusting your keywords or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMatches.slice(0, visibleCount).map(match => (
                <JobCard 
                  key={match.job.id} 
                  match={match} 
                  onApply={handleApply} 
                  onSave={handleSave}
                  isApplied={user.appliedJobIds.includes(match.job.id)}
                  isSaved={user.savedJobIds.includes(match.job.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div ref={observerTarget} className="h-10" />
    </div>
  );
};

export default Matches;
