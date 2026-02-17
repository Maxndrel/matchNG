
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserProfile, Job, MatchResult, JobApplication } from '../../types.ts';
import Matches from './Matches.tsx';
import Profile from './Profile.tsx';
import { getJobs, saveUser, getActiveUser, getStorageUsage, getApplicationsBySeeker } from '../../services/storage.ts';
import { getRecommendations, computeMatch } from '../../services/matchingEngine.ts';
import { getMarketInsights, getSkillGapAnalysis } from '../../services/analyticsEngine.ts';
import { SKILL_INDEX, INDUSTRIES } from '../../constants.ts';
import JobCard from '../../components/JobCard.tsx';
import BottomNav, { NavTabId } from '../../components/BottomNav.tsx';
import { useConnectivity } from '../../hooks/useConnectivity.ts';
import { 
  LayoutDashboard, 
  User, 
  Target, 
  FileText, 
  Star, 
  GraduationCap, 
  Settings, 
  Zap, 
  ArrowRight, 
  MapPin,
  ShieldCheck,
  Smartphone,
  CheckCircle,
  TrendingUp,
  Cpu,
  Sprout,
  Sun,
  Loader2,
  LogOut,
  ChevronRight,
  Database,
  CloudOff,
  ShieldAlert,
  BarChart3,
  Wallet,
  Activity,
  Flame,
  ChevronDown,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

interface SeekerDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
}

const SeekerDashboard: React.FC<SeekerDashboardProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<NavTabId>('OVERVIEW');
  const [isMounted, setIsMounted] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageUse, setStorageUse] = useState(0);
  const { isOnline } = useConnectivity();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allJobs, allApps] = await Promise.all([
        getJobs(),
        getApplicationsBySeeker(user.id)
      ]);
      setJobs(allJobs);
      setUserApplications(allApps);
      setStorageUse(getStorageUsage());
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
    window.addEventListener('storage-sync', fetchData);
    return () => window.removeEventListener('storage-sync', fetchData);
  }, [fetchData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('matchNG_last_tab');
      if (saved) setActiveTab(saved as NavTabId);
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('matchNG_last_tab', activeTab);
    }
  }, [activeTab, isMounted]);

  const allMatches = useMemo(() => {
    if (jobs.length === 0) return [];
    return getRecommendations(user, jobs);
  }, [user, jobs]);

  const marketInsights = useMemo(() => getMarketInsights(jobs), [jobs]);
  const skillGaps = useMemo(() => getSkillGapAnalysis(user, jobs), [user, jobs]);

  const readinessScore = useMemo(() => {
    if (skillGaps.length === 0) return 100;
    const avgMissingDemand = skillGaps.reduce((acc, s) => acc + s.demandRate, 0) / skillGaps.length;
    return Math.max(0, 100 - Math.floor(avgMissingDemand * 0.5));
  }, [skillGaps]);

  // pairing jobs with their specific application records
  const appliedJobsWithStatus = useMemo(() => {
    return userApplications.map(app => {
      const job = jobs.find(j => j.id === app.jobId);
      if (!job) return null;
      return {
        match: computeMatch(user, job),
        status: app.status
      };
    }).filter(Boolean);
  }, [userApplications, jobs, user]);

  const savedJobs = useMemo(() => {
    return jobs
      .filter(j => user.savedJobIds.includes(j.id))
      .map(j => computeMatch(user, j));
  }, [jobs, user.savedJobIds, user]);

  const handleUpdateUserInternal = async (updated: UserProfile) => {
    await onUpdateUser(updated);
  };

  const handleApply = async (jobId: string) => {
    if (user.appliedJobIds.includes(jobId)) return;
    const updatedUser = {
      ...user,
      appliedJobIds: [...user.appliedJobIds, jobId]
    };
    await onUpdateUser(updatedUser);
  };

  const handleSave = async (jobId: string) => {
    const isSaved = user.savedJobIds.includes(jobId);
    const updatedUser = {
      ...user,
      savedJobIds: isSaved 
        ? user.savedJobIds.filter(id => id !== jobId) 
        : [...user.savedJobIds, jobId]
    };
    await onUpdateUser(updatedUser);
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Syncing with MatchNG Cloud...</p>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">Moni, {user.fullName.split(' ')[0]}!</h2>
          <p className="text-gray-500 font-medium">Your career algorithm has matched {allMatches.length} opportunities today.</p>
        </div>
        {!isOnline && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
            <CloudOff className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Offline Mode</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:border-emerald-200 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Match confidence</p>
          <h3 className="text-5xl font-black text-emerald-600">{(allMatches[0]?.scoreFinal * 100 || 0).toFixed(0)}%</h3>
          <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(allMatches[0]?.scoreFinal * 100 || 0)}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:border-emerald-200 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Pipeline</p>
          <h3 className="text-5xl font-black text-gray-900">{jobs.length.toLocaleString()}</h3>
          <button onClick={() => setActiveTab('MATCHES')} className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline">
            Browse Engine <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:border-blue-200 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Applied</p>
          <h3 className="text-5xl font-black text-blue-600">{user.appliedJobIds.length}</h3>
          <button onClick={() => setActiveTab('APPLICATIONS')} className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-blue-600 hover:underline">
            Track Status <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
            <Zap className="w-3 h-3" /> Hottest Match
          </div>
          <h3 className="text-3xl font-black leading-tight">Recommended for {user.location.city || 'you'}</h3>
          {allMatches[0] && (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <h4 className="font-bold text-xl">{allMatches[0].job.title}</h4>
              <p className="text-gray-400 mb-4">{allMatches[0].job.employerName}</p>
              <button onClick={() => setActiveTab('MATCHES')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black hover:bg-emerald-500 transition-all">Apply Instantly</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-10 animate-in fade-in pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Career Growth Hub</h2>
          <p className="text-gray-500 font-medium mt-3">Data-driven insights to maximize your professional value.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
           <Activity className="w-4 h-4 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">Real-time Analysis</span>
        </div>
      </header>

      {/* Snapshot Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Flame className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Market Heat</p>
              <h4 className="text-xl font-black text-gray-900">{marketInsights.topIndustries[0].growth} Growth</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <Wallet className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Salary Benchmark</p>
              <h4 className="text-xl font-black text-gray-900">₦{marketInsights.salaryBenchmarks[user.primaryIndustry || 'Technology'].mid.toLocaleString()}</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Readiness Score</p>
              <h4 className="text-xl font-black text-gray-900">{readinessScore}% Ready</h4>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Skill Gap & Roadmaps */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Target className="w-6 h-6 text-emerald-600" />
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight">Skill Gap Analysis</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target: {user.primaryIndustry}</span>
             </div>

             <div className="space-y-6">
                {skillGaps.length === 0 ? (
                  <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h4 className="text-xl font-black text-emerald-900">Perfect Alignment!</h4>
                    <p className="text-emerald-700 font-medium">Your current skills match 100% of the top requirements in your sector.</p>
                  </div>
                ) : (
                  skillGaps.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-emerald-100 transition-all space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="text-lg font-black text-gray-900">{skill.name}</h4>
                             <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">High Demand: {skill.demandRate}% of jobs</p>
                          </div>
                          <div className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">Step {idx + 1}</div>
                       </div>
                       
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Recommended Roadmap</p>
                          <div className="flex flex-wrap gap-2">
                             {skill.resources.map((res, i) => (
                               <div key={i} className="flex-1 min-w-[140px] p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group cursor-pointer hover:border-emerald-500 transition-all">
                                  <BookOpen className="w-4 h-4 text-gray-400 mb-2 group-hover:text-emerald-500" />
                                  <p className="text-xs font-bold text-gray-900 leading-tight">{res.title}</p>
                                  <div className="mt-3 flex items-center justify-between">
                                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{res.provider}</span>
                                     <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </section>
        </div>

        {/* Right Column: Market Stats */}
        <div className="space-y-8">
          <section className="bg-gray-900 p-8 rounded-[2.5rem] text-white space-y-8 overflow-hidden relative">
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                   <BarChart3 className="w-6 h-6 text-emerald-400" />
                   <h3 className="text-xl font-black uppercase tracking-tight">Market Snapshot</h3>
                </div>
                
                <div className="space-y-5">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">High-Demand Industries</p>
                   <div className="space-y-3">
                      {marketInsights.topIndustries.slice(0, 4).map((ind, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-3">
                              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-black border border-white/20 rounded-md">{i + 1}</span>
                              <span className="text-sm font-bold group-hover:text-emerald-400 transition-colors">{ind.name}</span>
                           </div>
                           <span className="text-[10px] font-black text-emerald-400">{ind.growth}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Salary Growth Curve ({user.primaryIndustry})</p>
                   <div className="space-y-4">
                      {[
                        { label: 'Entry', val: marketInsights.salaryBenchmarks[user.primaryIndustry || 'Technology'].entry },
                        { label: 'Mid', val: marketInsights.salaryBenchmarks[user.primaryIndustry || 'Technology'].mid },
                        { label: 'Senior', val: marketInsights.salaryBenchmarks[user.primaryIndustry || 'Technology'].senior }
                      ].map((sal, i) => (
                        <div key={i} className="flex justify-between items-end">
                           <span className="text-xs font-medium opacity-60">{sal.label}</span>
                           <div className="flex flex-col items-end">
                              <span className="text-xs font-black">₦{sal.val.toLocaleString()}</span>
                              <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                 <div className="bg-emerald-500 h-full" style={{ width: `${(i+1)*33}%` }} />
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             
             {/* Decorative Background Element */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-black uppercase tracking-tight">Geographic Heat</h3>
             </div>
             <div className="space-y-4">
                {marketInsights.regionalDemand.slice(0, 3).map((reg, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>{reg.state}</span>
                        <span>{reg.demandScore}% Demand</span>
                     </div>
                     <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${reg.demandScore}%` }} />
                     </div>
                  </div>
                ))}
             </div>
             <button className="w-full py-4 border-2 border-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-200 hover:text-emerald-600 transition-all">
                Expand Full Map
             </button>
          </section>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW': return renderOverview();
      case 'PROFILE': return <Profile user={user} onUpdate={handleUpdateUserInternal} />;
      case 'MATCHES': return <Matches user={user} />;
      case 'TRAINING': return renderTraining();
      case 'APPLICATIONS':
        return (
          <div className="space-y-8 pb-32">
            <header>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Application Tracker</h2>
              <p className="text-gray-500 font-medium mt-3">Monitoring progress with {userApplications.length} employers.</p>
            </header>
            {appliedJobsWithStatus.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                <FileText className="w-16 h-16 text-gray-100 mb-6" />
                <h3 className="text-2xl font-black text-gray-900">No active applications</h3>
                <button onClick={() => setActiveTab('MATCHES')} className="mt-6 bg-emerald-600 text-white px-10 py-4 rounded-xl font-black">Find Your First Match</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appliedJobsWithStatus.map(data => (
                  <JobCard 
                    key={data.match.job.id} 
                    match={data.match} 
                    onApply={handleApply} 
                    onSave={handleSave} 
                    isApplied={true} 
                    isSaved={user.savedJobIds.includes(data.match.job.id)}
                    applicationStatus={data.status}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case 'SAVED':
        return (
          <div className="space-y-8 pb-32">
            <header>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Saved Opportunities</h2>
              <p className="text-gray-500 font-medium mt-3">Roles you've bookmarked for later consideration.</p>
            </header>
            {savedJobs.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                <Star className="w-16 h-16 text-gray-100 mb-6" />
                <p className="text-gray-400 font-black uppercase tracking-widest">Your save list is empty</p>
                <button onClick={() => setActiveTab('MATCHES')} className="mt-6 bg-emerald-600 text-white px-10 py-4 rounded-xl font-black">Browse Jobs</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedJobs.map(match => (
                  <JobCard 
                    key={match.job.id} 
                    match={match} 
                    onApply={handleApply} 
                    onSave={handleSave} 
                    isApplied={user.appliedJobIds.includes(match.job.id)} 
                    isSaved={true} 
                  />
                ))}
              </div>
            )}
          </div>
        );
      case 'SETTINGS':
        return (
          <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in pb-32">
            <header>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Account Hub</h2>
              <p className="text-gray-500 font-medium mt-3">Security and platform configuration.</p>
            </header>
            <div className="space-y-6">
               <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <Database className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black">Data Cache</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Using {storageUse.toFixed(1)}% of allocated space</p>
                     </div>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full" style={{ width: `${storageUse}%` }} />
                  </div>
               </div>
               <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-between p-8 rounded-[2rem] border border-red-100 bg-red-50/20 text-red-600 group"
                >
                  <span className="font-black text-lg uppercase tracking-widest">Terminate Session</span>
                  <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="relative pt-8 lg:pt-12 pb-32 min-h-screen">
      <main className="min-w-0 max-w-5xl mx-auto px-4">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  );
};

export default SeekerDashboard;
