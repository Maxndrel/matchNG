
import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { UserProfile, Job, MatchResult } from '../../types';
import { getJobs, saveUser } from '../../services/storage';
import { computeMatch } from '../../services/matchingEngine';
import JobCard from '../../components/JobCard';
import { INDUSTRIES, NIGERIA_STATES } from '../../constants';

interface MatchesProps {
  user: UserProfile;
}

const JOBS_PER_PAGE = 10;

const Matches: React.FC<MatchesProps> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isComputing, setIsComputing] = useState(true);
  const [visibleCount, setVisibleCount] = useState(JOBS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setJobs(getJobs());
      setIsComputing(false);
    };
    loadData();
    window.addEventListener('storage-sync', loadData);
    return () => window.removeEventListener('storage-sync', loadData);
  }, []);

  const handleApply = (jobId: string) => {
    if (user.appliedJobIds.includes(jobId)) return;
    const updatedUser = {
      ...user,
      appliedJobIds: [...user.appliedJobIds, jobId]
    };
    saveUser(updatedUser);
  };

  const handleSave = (jobId: string) => {
    const isSaved = user.savedJobIds.includes(jobId);
    const updatedUser = {
      ...user,
      savedJobIds: isSaved 
        ? user.savedJobIds.filter(id => id !== jobId) 
        : [...user.savedJobIds, jobId]
    };
    saveUser(updatedUser);
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

  if (isComputing) return <div className="py-20 text-center font-bold">Initializing matching pool...</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Career Matches</h1>
          <p className="text-gray-500 text-sm">Found {filteredMatches.length} high-probability roles.</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-2 rounded-xl font-bold border transition-all ${showFilters ? 'bg-gray-900 text-white' : 'bg-white border-gray-200'}`}
        >
          {showFilters ? 'Close Filters' : 'Filter Results'}
        </button>
      </header>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white border border-gray-100 rounded-3xl animate-in slide-in-from-top-2">
          <input 
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="p-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-sm"
          />
          <select 
            value={selectedIndustry}
            onChange={e => setSelectedIndustry(e.target.value)}
            className="p-3 bg-gray-50 rounded-xl outline-none text-sm"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select 
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="p-3 bg-gray-50 rounded-xl outline-none text-sm"
          >
            <option value="">All of Nigeria</option>
            {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-3">
             <label className="text-[10px] font-black uppercase text-gray-400">Min Score:</label>
             <input type="range" value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="accent-emerald-600 flex-grow" />
             <span className="text-xs font-bold w-8">{minScore}%</span>
          </div>
        </div>
      )}

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

      <div ref={observerTarget} className="h-10" />
    </div>
  );
};

export default Matches;
