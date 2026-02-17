
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
  addPendingAction,
  getStorageUsage
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
  Target,
  Briefcase,
  Star,
  ExternalLink
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
  const [storageUse, setStorageUse] = useState(0);
  
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
      status: 'DRAFT',
      salaryRange: ''
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
    setStorageUse(getStorageUsage());
    setIsSyncing(false);
  }, [user.id]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); 
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

    await saveJob(jobToPublish);
    
    // Reset draft
    setDraftJob({ title: '', industry: INDUSTRIES[0], description: '', requiredSkills: [], location: draftJob.location, isRemote: false, status: 'DRAFT', salaryRange: '' });
    setPostStep(1);
    setActiveTab('LISTINGS');
    refreshData();
  };

  const handleStatusChange = async (app: JobApplication, newStatus: ApplicationStatus) => {
    await saveApplication({ ...app, status: newStatus });
    refreshData();
  };

  const handleUpdateJobStatus = async (job: Job, newStatus: 'OPEN' | 'CLOSED') => {
    await saveJob({ ...job, status: newStatus });
    refreshData();
  };

  const matchedCandidates = useMemo(() => {
    if (!selectedJobId) return [];
    const job = allJobs.find(j => j.id === selectedJobId);
    if (!job) return [];
    return seekers
      .map(s => computeCandidateMatch(job, s))
      .sort((a, b) => b.scoreFinal - a.scoreFinal);
  }, [selectedJobId, allJobs, seekers]);

  if (!isMounted) return null;

  // --- RENDERING MODULES ---

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

  const renderListings = () => (
    <div className="space-y-8 animate-in fade-in pb-32">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Job Listings</h2>
          <p className="text-gray-500 font-medium">Manage your active and archived roles.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['OPEN', 'CLOSED'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setJobListingFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${jobListingFilter === f ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4">
        {allJobs.filter(j => j.status === jobListingFilter).length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <Briefcase className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">No {jobListingFilter.toLowerCase()} jobs found.</p>
          </div>
        ) : (
          allJobs.filter(j => j.status === jobListingFilter).map(job => (
            <div key={job.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-emerald-200 transition-all">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">{job.industry}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full">{job.isRemote ? 'Remote' : 'On-Site'}</span>
                </div>
                <h4 className="text-xl font-black text-gray-900">{job.title}</h4>
                <p className="text-xs text-gray-400 font-medium">{job.location.city}, {job.location.state} • Posted {new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setSelectedJobId(job.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-xs hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                >
                  View Matches
                </button>
                <button 
                  onClick={() => handleUpdateJobStatus(job, job.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                  className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-xs transition-all ${job.status === 'OPEN' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                >
                  {job.status === 'OPEN' ? 'Archive' : 'Restore'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="space-y-8 animate-in fade-in pb-32">
      <header className="space-y-2">
        <h2 className="text-3xl font-black text-gray-900">Candidate Match Discovery</h2>
        <p className="text-gray-500 font-medium">Identify top talent via the 3-factor matching algorithm.</p>
      </header>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter by Job Posting</label>
        <select 
          value={selectedJobId || ''}
          onChange={e => setSelectedJobId(e.target.value)}
          className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold text-gray-900"
        >
          <option value="">Select a job to run analysis...</option>
          {allJobs.filter(j => j.status === 'OPEN').map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {!selectedJobId ? (
        <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
           <Target className="w-12 h-12 text-gray-200 mx-auto mb-4" />
           <p className="text-gray-400 font-bold">Select an open role to find compatible seekers.</p>
        </div>
      ) : matchedCandidates.length === 0 ? (
        <div className="py-20 text-center">
           <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
           <p className="text-gray-400 font-black uppercase tracking-widest">Running Match Engine...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matchedCandidates.map(result => (
            <div key={result.seeker.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-emerald-200 hover:shadow-xl transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] flex flex-col items-center justify-center border-l border-b border-emerald-100">
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Match</span>
                  <span className="text-2xl font-black text-emerald-700">{(result.scoreFinal * 100).toFixed(0)}%</span>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                      <UserIcon className="w-7 h-7 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900">{result.seeker.fullName}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{result.seeker.location.city}, {result.seeker.location.state}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {result.seeker.skills.slice(0, 3).map(s => (
                      <span key={s} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold uppercase">{s}</span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Primary Industry: <span className="text-gray-900 font-bold">{result.seeker.primaryIndustry || 'N/A'}</span><br/>
                    Primary Skill: <span className="text-gray-900 font-bold">{result.seeker.primarySkill || 'N/A'}</span>
                  </p>
                  
                  <div className="pt-4 flex gap-2">
                    <button className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">View Full CV</button>
                    <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all">
                      <Star className="w-5 h-5" />
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-8 animate-in fade-in pb-32">
       <header>
          <h2 className="text-3xl font-black text-gray-900">Incoming Applications</h2>
          <p className="text-gray-500 font-medium">Manage intent from {applications.length} job seekers.</p>
       </header>

       <div className="grid gap-4">
         {applications.length === 0 ? (
           <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
             <Inbox className="w-12 h-12 text-gray-100 mx-auto mb-4" />
             <p className="text-gray-400 font-bold">No applications received yet.</p>
           </div>
         ) : (
           applications.map(app => (
             <div key={app.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-emerald-100 transition-all">
                <div className="flex-grow w-full md:w-auto">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        app.status === ApplicationStatus.SHORTLISTED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        app.status === ApplicationStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {app.status}
                      </span>
                      <span className="text-[9px] text-gray-300 font-bold">{new Date(app.timestamp).toLocaleDateString()}</span>
                   </div>
                   <h4 className="text-2xl font-black text-gray-900">{app.seekerName}</h4>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">Applying for: <span className="text-emerald-600">{app.jobTitle}</span></p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                   <button 
                    onClick={() => handleStatusChange(app, ApplicationStatus.SHORTLISTED)}
                    className="flex-1 md:flex-none p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all"
                   >
                     <CheckCircle className="w-6 h-6" />
                   </button>
                   <button 
                    onClick={() => handleStatusChange(app, ApplicationStatus.REJECTED)}
                    className="flex-1 md:flex-none p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                   >
                     <X className="w-6 h-6" />
                   </button>
                   <button className="flex-1 md:flex-none px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                     Details
                   </button>
                </div>
             </div>
           ))
         )}
       </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in pb-32">
       <header className="space-y-2">
         <h2 className="text-4xl font-black text-gray-900 tracking-tight">Employer Hub</h2>
         <p className="text-gray-500 font-medium">Configuration for {user.fullName}.</p>
       </header>

       <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Organization Profile</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Your public entity data</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entity Name</label>
                <input 
                  type="text" 
                  value={user.fullName}
                  readOnly
                  className="w-full p-4 bg-gray-50 border-transparent rounded-2xl font-bold text-gray-900 cursor-not-allowed opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Data & Infrastructure</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Local storage synchronization</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                <span>Local Cache Integrity</span>
                <span>{storageUse.toFixed(2)}% Used</span>
              </div>
              <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${storageUse}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <LogOut className="w-6 h-6" />
              <h3 className="text-xl font-black uppercase tracking-tight">Security</h3>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-between p-6 rounded-2xl border border-red-100 bg-red-50/30 text-red-600 hover:bg-red-50 transition-all group"
            >
              <span className="font-black text-sm uppercase tracking-widest">Terminate Active Session</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
       </div>
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
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Salary Range (Monthly)</label>
             <select 
               value={draftJob.salaryRange || ''}
               onChange={e => setDraftJob(d => ({ ...d, salaryRange: e.target.value }))}
               className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-emerald-500"
             >
               <option value="" disabled>Select range</option>
               <option value="₦100,000 - ₦200,000">₦100,000 - ₦200,000</option>
               <option value="₦200,000 - ₦350,000">₦200,000 - ₦350,000</option>
               <option value="₦350,000 - ₦500,000">₦350,000 - ₦500,000</option>
               <option value="₦500,000+">₦500,000+</option>
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
                {draftJob.salaryRange && (
                   <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-700">{draftJob.salaryRange}</span>
                )}
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

  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW': return renderOverview();
      case 'POST_JOB': return renderPostJob();
      case 'LISTINGS': return renderListings();
      case 'CANDIDATES': return renderCandidates();
      case 'APPLICATIONS': return renderApplications();
      case 'SETTINGS': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="relative pt-8 lg:pt-12 pb-32 min-h-screen bg-gray-50">
      <main className="min-w-0 max-w-5xl mx-auto px-4">
        {renderContent()}
      </main>
      <EmployerBottomNav activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  );
};

export default EmployerDashboard;
