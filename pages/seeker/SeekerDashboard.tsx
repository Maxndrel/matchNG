
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserProfile, Job, MatchResult } from '../../types.ts';
import Matches from './Matches.tsx';
import Profile from './Profile.tsx';
import { getJobs, saveUser, getActiveUser, getStorageUsage } from '../../services/storage.ts';
import { getRecommendations } from '../../services/matchingEngine.ts';
import { SKILL_INDEX } from '../../constants.ts';
import JobCard from '../../components/JobCard.tsx';
import BottomNav, { NavTabId } from '../../components/BottomNav.tsx';
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
  Database
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
  const [isLoading, setIsLoading] = useState(true);
  const [storageUse, setStorageUse] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getJobs();
      setJobs(data);
      setStorageUse(getStorageUsage());
    } catch (e) {
      console.error("Failed to fetch jobs", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener('storage-sync', fetchData);
    return () => window.removeEventListener('storage-sync', fetchData);
  }, [fetchData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('matchNG_last_tab');
      if (saved) {
        setActiveTab(saved as NavTabId);
      }
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

  const savedJobs = useMemo(() => {
    return allMatches.filter(m => user.savedJobIds.includes(m.job.id));
  }, [allMatches, user.savedJobIds]);

  const appliedJobs = useMemo(() => {
    return allMatches.filter(m => user.appliedJobIds.includes(m.job.id));
  }, [allMatches, user.appliedJobIds]);

  const skillGaps = useMemo(() => {
    const topSkillsInMatches = new Set<string>();
    const count = Math.min(10, allMatches.length);
    for (let i = 0; i < count; i++) {
      const match = allMatches[i];
      for (const s of match.job.requiredSkills) {
        topSkillsInMatches.add(s);
      }
    }
    const missing = Array.from(topSkillsInMatches).filter(s => !user.skills.includes(s));
    return missing.map(sid => SKILL_INDEX.get(sid)).filter(Boolean);
  }, [allMatches, user.skills]);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header>
              <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">Moni, {user.fullName.split(' ')[0]}!</h2>
              <p className="text-gray-500 font-medium">Your career algorithm has matched {allMatches.length} opportunities today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:border-emerald-200 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Match Confidence</p>
                <h3 className="text-5xl font-black text-emerald-600">{(allMatches[0]?.scoreFinal * 100 || 0).toFixed(0)}%</h3>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(allMatches[0]?.scoreFinal * 100 || 0)}%` }}></div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:border-emerald-200 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Pipeline</p>
                <h3 className="text-5xl font-black text-gray-900">{jobs.length.toLocaleString()}</h3>
                <button onClick={() => setActiveTab('MATCHES')} className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline text-left">
                  Browse Engine <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:border-blue-200 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Interests</p>
                <h3 className="text-5xl font-black text-blue-600">{user.appliedJobIds.length}</h3>
                <button onClick={() => setActiveTab('APPLICATIONS')} className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-blue-600 hover:underline text-left">
                  Track Status <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative group">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-grow space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                    <Zap className="w-3 h-3" /> Hottest Match This Hour
                  </div>
                  <h3 className="text-3xl font-black leading-tight">Recommended for your skills in {user.location.city || 'Nigeria'}</h3>
                  {allMatches[0] && (
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <h4 className="font-bold text-xl">{allMatches[0].job.title}</h4>
                      <p className="text-gray-400 mb-4">{allMatches[0].job.employerName} • {allMatches[0].job.industry}</p>
                      <div className="flex gap-2">
                         <span className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                           <Target className="w-3 h-3" /> {(allMatches[0].scoreFinal * 100).toFixed(0)}% Match
                         </span>
                         <span className="flex items-center gap-1 bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                           <MapPin className="w-3 h-3" /> Near You
                         </span>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setActiveTab('MATCHES')} className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900">Explore Matching Pool</button>
                </div>
              </div>
            </section>
          </div>
        );

      case 'PROFILE':
        return <Profile user={user} onUpdate={onUpdateUser} />;

      case 'MATCHES':
        return <Matches user={user} />;

      case 'TRAINING':
        return (
          <div className="space-y-12 animate-in fade-in">
            <header className="max-w-2xl space-y-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Skill Gap Accelerator</h2>
              <p className="text-gray-500 font-medium">We analyzed your top matches. Acquiring these skills could increase your match rate by up to 40%.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Missing High-Value Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillGaps.length === 0 ? (
                    <p className="text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-2xl w-full border border-emerald-100">
                      Perfect! You possess all the primary skills requested in your top 10 matches.
                    </p>
                  ) : (
                    skillGaps.map(skill => (
                      <span key={skill?.id} className="px-5 py-3 bg-red-50 text-red-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-2">
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                         {skill?.name}
                      </span>
                    ))
                  )}
                </div>
                <div className="pt-4 border-t border-gray-50">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recommended Training Partners</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 cursor-pointer transition-all">
                        <p className="text-xs font-black">Utiva Tech</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Digital Skills</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 cursor-pointer transition-all">
                        <p className="text-xs font-black">FarmCrowdy Edu</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Agri-Business</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white space-y-8 shadow-2xl shadow-emerald-100">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Growth Multiplier</h3>
                </div>
                <p className="text-emerald-100 text-sm leading-relaxed">
                  Our algorithm tracks "Trend Multipliers" (20% weight). Currently, **Logistics** and **Solar Maintenance** skills are receiving a 1.5x boost in score calculations.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Logistics Optimization', icon: Sprout },
                    { label: 'Solar Photovoltaics', icon: Sun }
                  ].map((it, i) => (
                    <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/20 transition-all">
                      <div className="flex items-center gap-3">
                        <it.icon className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-sm">{it.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'SETTINGS':
        return (
          <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in pb-20">
             <header className="space-y-2">
               <h2 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h2>
               <p className="text-gray-500 font-medium">Manage your notifications and account preferences.</p>
             </header>

             <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-gray-900" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Data Footprint</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                      <span>LocalStorage Usage</span>
                      <span>{storageUse.toFixed(2)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${storageUse}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium italic">Persistent storage ensures your drafts and matches are available even offline.</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-gray-900" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Low-Bandwidth Modes</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <p className="font-bold text-gray-900">SMS Matching Alerts</p>
                        <p className="text-xs text-gray-400 font-medium italic">Receive top 3 matches via SMS when offline.</p>
                      </div>
                      <button className="w-12 h-6 bg-emerald-500 rounded-full p-1 flex items-center shadow-inner text-white">
                        <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Algorithm Privacy</h3>
                  </div>
                  <p className="text-gray-500 text-sm italic">You are currently sharing your **Location** and **Skill Set** with our matching engine. This is required for high-accuracy placement.</p>
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-black text-xs uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4" /> GDPR / NDPR Compliant
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 text-red-600">
                    <User className="w-6 h-6" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Account Management</h3>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center justify-between p-5 rounded-2xl border border-red-100 bg-red-50/30 text-red-600 hover:bg-red-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5" />
                        <span className="font-black text-sm uppercase tracking-widest">Sign Out of matchNG</span>
                      </div>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("This will delete all locally saved data and drafts. Continue?")) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="w-full mt-4 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-red-400 transition-colors"
                    >
                      Purge Local Data Cache
                    </button>
                  </div>
                </div>
             </div>
             
             <button className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-black transition shadow-xl">Save All Preferences</button>
          </div>
        );

      case 'APPLICATIONS':
        return (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black text-gray-900">Application Tracker</h2>
              <p className="text-gray-500 font-medium">Monitoring your progress with {user.appliedJobIds.length} employers.</p>
            </header>
            {appliedJobs.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">No active applications</h3>
                <p className="text-gray-500 mb-8 max-w-sm">One-tap apply to start tracking your career progress.</p>
                <button onClick={() => setActiveTab('MATCHES')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold">Start Matching</button>
              </div>
            ) : (
              <div className="grid gap-6">
                {appliedJobs.map(match => (
                  <div key={match.job.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-emerald-200 transition-colors">
                    <div className="flex-grow space-y-2 text-left w-full">
                      <h4 className="text-2xl font-black text-gray-900">{match.job.title}</h4>
                      <p className="text-gray-500 font-bold">{match.job.employerName} • {match.job.location.city}</p>
                      <div className="flex gap-4 pt-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Stage: Shortlisted</span>
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">Sent recently</span>
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">View Status</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'SAVED':
        return (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black text-gray-900">Saved Opportunities</h2>
              <p className="text-gray-500 font-medium">Roles you bookmarked for later consideration.</p>
            </header>
            {savedJobs.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border-gray-100 flex flex-col items-center">
                <Star className="w-12 h-12 text-gray-100 mb-4" />
                <p className="text-gray-400 font-black uppercase tracking-widest">No saved jobs yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {savedJobs.map(match => (
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
        );

      default:
        return <div className="py-20 text-center text-gray-400 font-black uppercase tracking-widest">Module under construction</div>;
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
