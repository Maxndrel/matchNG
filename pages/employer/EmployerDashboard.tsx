
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
// Added Search and Target to fix the missing name errors on lines 244, 526, and 532
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
    };

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
                      requiredSkills: current.includes(skill.id) 
                        ? current.filter(s => s !== skill.id)
                        : [...current, skill.id]
                    }));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    draftJob.requiredSkills?.includes(skill.id)
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
                  {draftJob.requiredSkills?.map(sid => {
                    const s = SKILL_INDEX.get(sid);
                    return <span key={sid} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">{s?.name}</span>
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

  const renderJobListings = () => (
    <div className="space-y-8 animate-in fade-in pb-32">
       <header className="flex justify-between items-end">
         <div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tight">Manage Listings</h2>
           <p className="text-gray-500 font-medium">Monitoring the lifecycle of your roles.</p>
         </div>
         <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {(['OPEN', 'DRAFT', 'CLOSED'] as const).map(f => (
              <button key={f} onClick={() => setJobListingFilter(f)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${jobListingFilter === f ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{f}</button>
            ))}
         </div>
       </header>

       <div className="grid gap-6">
         {allJobs.filter(j => j.status === jobListingFilter).length === 0 ? (
           <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
             <FileText className="w-12 h-12 text-gray-100 mb-4" />
             <p className="text-gray-400 font-black uppercase tracking-widest">No roles found in this state.</p>
           </div>
         ) : (
           allJobs.filter(j => j.status === jobListingFilter).map(job => (
             <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-emerald-200 transition-all">
               <div className="flex-grow w-full space-y-2">
                 <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-black text-gray-900">{job.title}</h4>
                    <span className="px-2 py-0.5 bg-gray-50 text-[10px] font-bold text-gray-400 rounded border border-gray-100">{job.id}</span>
                 </div>
                 <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic">{job.industry} • Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                 <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest"><Inbox className="w-3 h-3" /> {applications.filter(a => a.jobId === job.id).length} Applicants</div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest"><Users className="w-3 h-3" /> 12 Matches</div>
                 </div>
               </div>
               <div className="flex gap-2 w-full md:w-auto">
                 <button onClick={() => { setSelectedJobId(job.id); setActiveTab('CANDIDATES'); }} className="px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">View Matches</button>
                 <button onClick={() => saveJob({ ...job, status: job.status === 'OPEN' ? 'CLOSED' : 'OPEN' })} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors">{job.status === 'OPEN' ? 'Close Listing' : 'Re-open'}</button>
               </div>
             </div>
           ))
         )}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 lg:pt-16">
      <main className="max-w-6xl mx-auto px-4">
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'POST_JOB' && renderPostJob()}
        {activeTab === 'LISTINGS' && renderJobListings()}
        {activeTab === 'SETTINGS' && (
          <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in pb-32">
             <header>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">Settings</h2>
                <p className="text-gray-500 font-medium">Manage your hiring pipeline and data lifecycle.</p>
             </header>

             <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                   <div className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-gray-900" />
                      <h3 className="text-xl font-black uppercase tracking-tight">Local Cache Management</h3>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">Auto-save Drafts</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black">Active (1000ms delay)</p>
                      </div>
                      <button className="w-12 h-6 bg-emerald-500 rounded-full p-1 flex items-center shadow-inner">
                         <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                      </button>
                   </div>
                   <button 
                    onClick={() => { localStorage.removeItem(`matchNG:v1:drafts:${user.id}:new-job-draft`); window.location.reload(); }} 
                    className="w-full text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                   >
                     Clear Local Job Drafts
                   </button>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                   <div className="flex items-center gap-3 text-red-600">
                      <LogOut className="w-6 h-6" />
                      <h3 className="text-xl font-black uppercase tracking-tight">Security</h3>
                   </div>
                   <button onClick={onLogout} className="w-full flex items-center justify-between p-5 rounded-2xl border border-red-100 bg-red-50/30 text-red-600 hover:bg-red-50 transition-all group">
                      <span className="font-black text-sm uppercase tracking-widest">Logout from matchNG</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
          </div>
        )}
        {/* Candidates and Applications tabs reuse logic from provided context but with enhanced polling/filtering */}
        {activeTab === 'APPLICATIONS' && (
           <div className="space-y-8 animate-in fade-in pb-32">
              <header>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Applications ({applications.length})</h2>
                <p className="text-gray-500 font-medium">Vetted seekers awaiting your review.</p>
              </header>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                {applications.length === 0 ? <p className="p-20 text-center text-gray-400 font-bold italic">No applications received yet.</p> : applications.map(app => (
                  <div key={app.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-gray-50/50 transition-all group">
                    <div className="flex items-center gap-6 w-full text-left">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-300"><UserIcon /></div>
                      <div>
                        <p className="font-black text-gray-900 text-lg">{app.seekerName}</p>
                        <p className="text-emerald-600 font-bold text-sm">{app.jobTitle}</p>
                        <p className="text-[10px] text-gray-400 font-medium italic mt-1">Applied {new Date(app.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      {app.status === ApplicationStatus.PENDING && (
                        <>
                          <button onClick={() => handleStatusChange(app, ApplicationStatus.SHORTLISTED)} className="flex-1 md:flex-none p-4 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95"><CheckSquare className="w-5 h-5" /></button>
                          <button onClick={() => handleStatusChange(app, ApplicationStatus.REJECTED)} className="flex-1 md:flex-none p-4 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 active:scale-95"><X className="w-5 h-5" /></button>
                        </>
                      )}
                      {app.status !== ApplicationStatus.PENDING && <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${app.status === ApplicationStatus.SHORTLISTED ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>{app.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}
        {activeTab === 'CANDIDATES' && (
           <div className="space-y-8 animate-in fade-in pb-32">
              <header>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Match Explorer</h2>
                <div className="mt-4 relative group">
                   <select 
                    value={selectedJobId || ''} 
                    onChange={e => setSelectedJobId(e.target.value)} 
                    className="w-full p-5 bg-white border border-gray-100 rounded-[1.5rem] font-bold outline-none focus:border-emerald-500 shadow-sm transition-all pl-12"
                   >
                     <option value="">Select a role to run the matching engine...</option>
                     {allJobs.filter(j => j.status === 'OPEN').map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                   </select>
                   <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500" />
                </div>
              </header>
              <div className="grid gap-6">
                {!selectedJobId ? (
                   <div className="py-24 text-center bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center">
                      <Search className="w-12 h-12 text-gray-100 mb-4" />
                      <p className="text-gray-400 font-bold italic">Awaiting role selection...</p>
                   </div>
                ) : matchedCandidates.length === 0 ? (
                  <p className="text-center py-20 text-gray-400 font-bold italic">No candidates found with high compatibility scores.</p>
                ) : matchedCandidates.map(c => (
                  <div key={c.seeker.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-xl text-gray-200 group-hover:text-emerald-500 transition-colors"><UserIcon /></div>
                      <div>
                        <p className="text-2xl font-black text-gray-900">{c.seeker.fullName}</p>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{c.seeker.location.city || c.seeker.location.state}</p>
                      </div>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl border-4 flex flex-col items-center justify-center ${c.scoreFinal > 0.8 ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-gray-100 text-gray-400'}`}>
                       <span className="text-[10px] font-black uppercase opacity-40">Score</span>
                       <span className="text-lg font-black">{(c.scoreFinal * 100).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}
      </main>
      <EmployerBottomNav activeTab={activeTab} onSelect={setActiveTab} isPublishing={isSyncing} />
    </div>
  );
};

export default EmployerDashboard;
