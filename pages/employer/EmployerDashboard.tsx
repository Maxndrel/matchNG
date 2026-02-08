
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserProfile, Job, UserRole, ApplicationStatus, JobApplication, Notification } from '../../types.ts';
import { 
  getJobsByEmployer, 
  getUsers, 
  getApplicationsByEmployer, 
  saveApplication, 
  getNotifications, 
  markNotifRead,
  saveJob,
  getJobs,
  addPendingAction
} from '../../services/storage.ts';
import { useClientLocalStore } from '../../hooks/useClientLocalStore.ts';
import { computeCandidateMatch } from '../../services/matchingEngine.ts';
import { INDUSTRIES, SKILL_TAXONOMY, NIGERIA_STATES, SKILL_INDEX } from '../../constants.ts';
import EmployerBottomNav, { EmployerTabId } from '../../components/EmployerBottomNav.tsx';
import { 
  PlusCircle, 
  Users, 
  Inbox, 
  Settings, 
  TrendingUp, 
  User as UserIcon, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin, 
  Globe,
  Trash2,
  Check,
  X,
  FileText,
  Save,
  Rocket,
  Bell,
  CheckSquare,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Database,
  Search,
  Target
} from 'lucide-react';

interface EmployerDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<EmployerTabId>('OVERVIEW');
  const [isMounted, setIsMounted] = useState(false);

  // Core Data State
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [seekers, setSeekers] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // UI State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobListingFilter, setJobListingFilter] = useState<'OPEN' | 'DRAFT' | 'CLOSED'>('OPEN');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // 1. DRAFT PERSISTENCE
  const [draftJob, setDraftJob, draftMeta] = useClientLocalStore<Partial<Job>>(
    `${user.id}:new-job-draft`,
    { 
      title: '', 
      industry: INDUSTRIES[0], 
      description: '', 
      requiredSkills: [],
      location: { state: 'Lagos', lga: '', city: '', lat: 6.5, lon: 3.3 },
      isRemote: false,
      status: 'DRAFT'
    }
  );

  const [postStep, setPostStep] = useState(1);

  // Client-only hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`matchNG_employer_tab_${user.id}`);
      if (saved) setActiveTab(saved as EmployerTabId);
      setIsMounted(true);
    }
  }, [user.id]);

  const refreshData = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setIsSyncing(true);
    const [jobs, allUsers, apps, notes] = await Promise.all([
      getJobsByEmployer(user.id),
      getUsers(),
      getApplicationsByEmployer(user.id),
      getNotifications(user.id)
    ]);

    setAllJobs(jobs);
    setSeekers(allUsers.filter(u => u.role === UserRole.SEEKER));
    setApplications(apps);
    setNotifications(notes);
    setIsSyncing(false);
  }, [user.id]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // Poll for real-time applications
    window.addEventListener('storage-sync', refreshData);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage-sync', refreshData);
    };
  }, [refreshData]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem(`matchNG_employer_tab_${user.id}`, activeTab);
    }
  }, [activeTab, isMounted, user.id]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  // 2. ATOMIC ACTIONS
  const handlePublishJob = async () => {
    if (!draftJob.title || !draftJob.description) {
      alert("Please complete title and description before publishing.");
      return;
    }

    const jobToPublish: Job = {
      ...(draftJob as Job),
      id: `j-${Date.now()}`,
      employerId: user.id,
      employerName: user.fullName,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    } as Job;

    if (!navigator.onLine) {
      await addPendingAction({ type: 'UPDATE_PROFILE', payload: jobToPublish }); // Reusing generic profile update for jobs
      alert("Offline: Job queued for publication.");
    } else {
      await saveJob(jobToPublish);
      alert("Success: Job is now live on the matching engine!");
    }

    // Reset draft
    setDraftJob({ title: '', industry: INDUSTRIES[0], description: '', requiredSkills: [], location: draftJob.location, isRemote: false, status: 'DRAFT' });
    setPostStep(1);
    setActiveTab('LISTINGS');
  };

  const handleStatusChange = async (app: JobApplication, newStatus: ApplicationStatus) => {
    await saveApplication({ ...app, status: newStatus });
    refreshData();
  };

  const matchedCandidates = useMemo(() => {
    if (!selectedJobId) return [];
    const job = allJobs.find(j => j.id === selectedJobId);
    if (!job) return [];
    return seekers.map(s => computeCandidateMatch(job, s)).sort((a, b) => b.scoreFinal - a.scoreFinal);
  }, [selectedJobId, allJobs, seekers]);

  if (!isMounted) return null;

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-24">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Kabo, {user.fullName.split(' ')[0]}</h2>
          <p className="text-gray-500 font-medium mt-2">Active Recruitment Pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          {isSyncing && <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3 rounded-2xl border transition-all relative ${unreadCount > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-gray-100 text-gray-400'}`}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 p-4 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95">
                 <div className="flex justify-between items-center mb-4 px-2">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notifications</h4>
                   <button onClick={() => setShowNotifications(false)} className="text-gray-300">✕</button>
                 </div>
                 <div className="space-y-3">
                   {notifications.length === 0 ? <p className="text-center py-8 text-gray-400 font-medium">No new activity.</p> : notifications.map(n => (
                     <div key={n.id} onClick={async () => { await markNotifRead(n.id); if (n.linkToTab) setActiveTab(n.linkToTab as EmployerTabId); setShowNotifications(false); }} className={`p-4 rounded-2xl cursor-pointer border transition-all ${!n.isRead ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-transparent opacity-60'}`}>
                        <p className="text-xs font-black text-gray-900">{n.title}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{n.message}</p>
                        <p className="text-[8px] text-gray-400 mt-2">{new Date(n.timestamp).toLocaleTimeString()}</p>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Jobs', val: allJobs.filter(j => j.status === 'OPEN').length, icon: Rocket, color: 'emerald' },
          { label: 'Unprocessed Apps', val: applications.filter(a => a.status === ApplicationStatus.PENDING).length, icon: Inbox, color: 'blue' },
          { label: 'Drafts', val: draftJob.title ? 1 : 0, icon: FileText, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative group">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
             <h3 className="text-5xl font-black text-gray-900 mt-2">{stat.val}</h3>
             <stat.icon className={`absolute top-8 right-8 w-12 h-12 opacity-5 text-${stat.color}-600`} />
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setActiveTab('POST_JOB')} className="bg-emerald-600 p-8 rounded-[2rem] text-white flex items-center justify-between group hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
           <div>
             <h3 className="text-xl font-black">Hire Top Talent</h3>
             <p className="text-emerald-100 text-sm mt-1">Start a new listing from scratch.</p>
           </div>
           <PlusCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={() => setActiveTab('CANDIDATES')} className="bg-gray-900 p-8 rounded-[2rem] text-white flex items-center justify-between group hover:bg-black transition-all">
           <div>
             <h3 className="text-xl font-black">Match Discovery</h3>
             <p className="text-gray-400 text-sm mt-1">Browse seekers by job requirement.</p>
           </div>
           <Search className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      </section>
    </div>
  );

  const renderPostJob = () => (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in pb-32">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Create Job Listing</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${draftMeta.isDirty ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {draftMeta.isDirty ? 'Saving Draft...' : 'Draft Saved'}
            </span>
            {draftMeta.lastSavedAt && <span className="text-[10px] text-gray-400 font-medium italic">Last saved {new Date(draftMeta.lastSavedAt).toLocaleTimeString()}</span>}
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${postStep >= s ? 'bg-emerald-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </header>

      {postStep === 1 && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-right-4">
           <div className="space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Title</label>
             <input 
               type="text" 
               value={draftJob.title}
               onChange={e => setDraftJob(d => ({ ...d, title: e.target.value }))}
               placeholder="e.g. Senior Backend Engineer" 
               className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-emerald-500"
             />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Industry Cluster</label>
             <select 
               value={draftJob.industry}
               onChange={e => setDraftJob(d => ({ ...d, industry: e.target.value }))}
               className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-emerald-500"
             >
               {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
             <textarea 
               rows={6}
               value={draftJob.description}
               onChange={e => setDraftJob(d => ({ ...d, description: e.target.value }))}
               placeholder="Detail the responsibilities and key outcomes..." 
               className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium outline-none focus:border-emerald-500"
             />
           </div>
           <button onClick={() => setPostStep(2)} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black hover:bg-emerald-700 transition flex items-center justify-center gap-2">
              Next: Skills & Requirements <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      )}

      {postStep === 2 && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-right-4">
           <div className="space-y-4">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Core Requirements (Select Tags)</label>
             <div className="flex flex-wrap gap-2">
               {SKILL_TAXONOMY.map(skill => (
                 <button 
                  key={skill.id} 
                  onClick={() => {
                    const current = draftJob.requiredSkills || [];
                    setDraftJob(d => ({
                      ...d,
                      requiredSkills: current.includes(skill.name) 
                        ? current.filter(s => s !== skill.name)
                        : [...current, skill.name]
                    }));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    draftJob.requiredSkills?.includes(skill.name)
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200'
                  }`}
                 >
                   {skill.name}
                 </button>
               ))}
             </div>
           </div>
           
           <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
              <div>
                <h4 className="font-black text-emerald-900">Remote Compatible?</h4>
                <p className="text-xs text-emerald-700">Allow candidates from all states to apply.</p>
              </div>
              <button 
                onClick={() => setDraftJob(d => ({ ...d, isRemote: !d.isRemote }))}
                className={`w-14 h-8 rounded-full p-1 transition-all ${draftJob.isRemote ? 'bg-emerald-600' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${draftJob.isRemote ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
           </div>

           <div className="flex gap-4">
             <button onClick={() => setPostStep(1)} className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-black hover:bg-gray-200 transition">Back</button>
             <button onClick={() => setPostStep(3)} className="flex-1 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black hover:bg-emerald-700 transition">Review & Publish</button>
           </div>
        </div>
      )}

      {postStep === 3 && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10 animate-in slide-in-from-right-4">
           <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6">
              <h3 className="text-3xl font-black text-gray-900">{draftJob.title || 'Untitled Role'}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600">{draftJob.industry}</span>
                <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">{draftJob.isRemote ? 'Remote' : 'On-site'}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{draftJob.description}</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Skills</p>
                <div className="flex flex-wrap gap-2">
                  {draftJob.requiredSkills?.map(sName => {
                    const s = SKILL_INDEX.get(sName);
                    return <span key={sName} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">{s?.name || sName}</span>
                  })}
                </div>
              </div>
           </div>

           <div className="flex gap-4">
             <button onClick={() => setPostStep(2)} className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-black hover:bg-gray-200 transition">Edit Details</button>
             <button onClick={handlePublishJob} className="flex-1 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition flex items-center justify-center gap-2">
               <Rocket className="w-5 h-5" /> Confirm & Publish
             </button>
           </div>
        </div>
      )}
    </div>
  );

  // Added renderContent to handle tab switching
  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return renderOverview();
      case 'POST_JOB':
        return renderPostJob();
      default:
        return (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900">Module under construction</h3>
            <p className="text-gray-400 text-sm font-medium">We are currently fine-tuning this specialized tool.</p>
          </div>
        );
    }
  };

  // Added main return statement
  return (
    <div className="relative pt-8 lg:pt-12 pb-32 min-h-screen">
      <main className="min-w-0 max-w-5xl mx-auto px-4">
        {renderContent()}
      </main>
      <EmployerBottomNav activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  );
};

// Added missing default export
export default EmployerDashboard;
