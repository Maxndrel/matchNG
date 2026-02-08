
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserProfile, Job, UserRole, ApplicationStatus, JobApplication, Notification } from '../../types';
import { 
  getJobsByEmployer, 
  getUsers, 
  getApplicationsByEmployer, 
  saveApplication, 
  getNotifications, 
  markNotifRead,
  saveJob,
  deleteJob
} from '../../services/storage';
import { computeCandidateMatch } from '../../services/matchingEngine';
import { INDUSTRIES, SKILL_TAXONOMY, NIGERIA_STATES, SKILL_INDEX } from '../../constants';
import EmployerBottomNav, { EmployerTabId } from '../../components/EmployerBottomNav';
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
  CheckSquare
} from 'lucide-react';

interface EmployerDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

const QUICK_ACTIONS = [
  { id: 'POST_JOB', label: 'Create Listing', icon: PlusCircle, color: 'text-emerald-600' },
  { id: 'CANDIDATES', label: 'Review Matches', icon: Users, color: 'text-blue-600' },
  { id: 'SETTINGS', label: 'Profile Settings', icon: Settings, color: 'text-gray-600' }
];

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ user, onUpdateUser }) => {
  // Initialize with default, populate from storage in useEffect
  const [activeTab, setActiveTab] = useState<EmployerTabId>('OVERVIEW');
  const [isMounted, setIsMounted] = useState(false);

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [seekers, setSeekers] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobListingFilter, setJobListingFilter] = useState<'OPEN' | 'DRAFT' | 'CLOSED'>('OPEN');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [postStep, setPostStep] = useState(1);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '', industry: INDUSTRIES[0], description: '', requiredSkills: [],
    location: { state: 'Lagos', lga: '', city: '', lat: 6.5, lon: 3.3 },
    isRemote: false, status: 'OPEN'
  });

  // Client-only hydration for tab state
  useEffect(() => {
    const saved = localStorage.getItem('matchNG_employer_tab');
    if (saved) setActiveTab(saved as EmployerTabId);
    setIsMounted(true);
  }, []);

  const refreshData = useCallback(() => {
    setAllJobs(getJobsByEmployer(user.id));
    setSeekers(getUsers().filter(u => u.role === UserRole.SEEKER));
    setApplications(getApplicationsByEmployer(user.id));
    setNotifications(getNotifications(user.id));
  }, [user.id]);

  useEffect(() => {
    refreshData();
    window.addEventListener('storage-sync', refreshData);
    return () => window.removeEventListener('storage-sync', refreshData);
  }, [refreshData]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('matchNG_employer_tab', activeTab);
    }
  }, [activeTab, isMounted]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const handleStatusChange = (app: JobApplication, newStatus: ApplicationStatus) => {
    saveApplication({ ...app, status: newStatus });
  };

  const handleJobStatusChange = (jobId: string, newStatus: 'OPEN' | 'CLOSED' | 'DRAFT') => {
    const job = allJobs.find(j => j.id === jobId);
    if (job) saveJob({ ...job, status: newStatus });
  };

  const matchedCandidates = useMemo(() => {
    if (!selectedJobId) return [];
    const job = allJobs.find(j => j.id === selectedJobId);
    if (!job) return [];
    return seekers.map(s => computeCandidateMatch(job, s)).sort((a, b) => b.scoreFinal - a.scoreFinal);
  }, [selectedJobId, allJobs, seekers]);

  // -----------------------------------------------------------------------------
  // RENDERERS
  // -----------------------------------------------------------------------------
  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-24">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Kabo, {user.fullName.split(' ')[0]}</h2>
          <p className="text-gray-500 font-medium mt-2">Recruitment Pipeline Pulse</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-3 rounded-2xl border transition-all relative ${unreadCount > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600 animate-bounce' : 'bg-white border-gray-100 text-gray-400'}`}
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
                 {notifications.length === 0 ? <p className="text-center py-8 text-gray-400 font-medium">Clear as day.</p> : notifications.map(n => (
                   <div key={n.id} onClick={() => { markNotifRead(n.id); if (n.linkToTab) setActiveTab(n.linkToTab as EmployerTabId); setShowNotifications(false); }} className={`p-4 rounded-2xl cursor-pointer border transition-all ${!n.isRead ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-transparent opacity-60'}`}>
                      <p className="text-xs font-black text-gray-900">{n.title}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{n.message}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Jobs', val: allJobs.filter(j => j.status === 'OPEN').length, icon: Rocket, color: 'emerald' },
          { label: 'Applications', val: applications.length, icon: Inbox, color: 'blue' },
          { label: 'Drafts', val: allJobs.filter(j => j.status === 'DRAFT').length, icon: FileText, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative group">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
             <h3 className="text-5xl font-black text-gray-900 mt-2">{stat.val}</h3>
             <stat.icon className={`absolute top-8 right-8 w-12 h-12 opacity-5 text-${stat.color}-600`} />
          </div>
        ))}
      </div>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map(action => (
          <button key={action.id} onClick={() => setActiveTab(action.id as EmployerTabId)} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-all active:scale-95">
            <div className={`p-3 rounded-2xl bg-gray-50 ${action.color}`}><action.icon className="w-5 h-5" /></div>
            <span className="font-bold text-sm text-gray-700">{action.label}</span>
          </button>
        ))}
      </section>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-8 animate-in fade-in pb-32">
      <header>
        <h2 className="text-3xl font-black text-gray-900">Pipeline Management</h2>
        <p className="text-gray-500 font-medium">Manage seeker transitions in the matching ecosystem.</p>
      </header>
      {applications.length === 0 ? (
        <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
          <Inbox className="w-12 h-12 text-gray-100 mx-auto mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest">Your inbox is currently empty.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {applications.map(app => (
            <div key={app.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-gray-50/50 transition-all group">
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${app.status === ApplicationStatus.SHORTLISTED ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {app.seekerName.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-gray-900">{app.seekerName}</p>
                  <p className="text-emerald-600 font-bold text-sm leading-tight">{app.jobTitle}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-2 inline-block border ${app.status === ApplicationStatus.SHORTLISTED ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                    {app.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {app.status === ApplicationStatus.PENDING && (
                  <>
                    <button onClick={() => handleStatusChange(app, ApplicationStatus.SHORTLISTED)} className="flex-grow md:flex-none p-3.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95"><CheckSquare className="w-5 h-5" /></button>
                    <button onClick={() => handleStatusChange(app, ApplicationStatus.REJECTED)} className="flex-grow md:flex-none p-3.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 active:scale-95"><X className="w-5 h-5" /></button>
                  </>
                )}
                {app.status === ApplicationStatus.SHORTLISTED && (
                  <button onClick={() => handleStatusChange(app, ApplicationStatus.HIRED)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Complete Hire</button>
                )}
                {app.status === ApplicationStatus.REJECTED && (
                  <button onClick={() => handleStatusChange(app, ApplicationStatus.PENDING)} className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold">Re-consider</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 lg:pt-16">
      <main className="max-w-6xl mx-auto px-4">
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'APPLICATIONS' && renderApplications()}
        {activeTab === 'LISTINGS' && (
          <div className="space-y-8 animate-in fade-in pb-32">
             <header className="flex justify-between items-end">
               <div><h2 className="text-3xl font-black text-gray-900">Listings</h2><p className="text-gray-500 font-medium">Manage role lifecycles.</p></div>
               <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100">
                  {(['OPEN', 'DRAFT', 'CLOSED'] as const).map(f => (
                    <button key={f} onClick={() => setJobListingFilter(f)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${jobListingFilter === f ? 'bg-gray-900 text-white' : 'text-gray-400'}`}>{f}</button>
                  ))}
               </div>
             </header>
             <div className="grid gap-6">
               {allJobs.filter(j => j.status === jobListingFilter).map(job => (
                 <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
                   <div className="flex-grow w-full">
                     <h4 className="text-2xl font-black text-gray-900">{job.title}</h4>
                     <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">{job.industry} • {job.location.state}</p>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => handleJobStatusChange(job.id, job.status === 'OPEN' ? 'CLOSED' : 'OPEN')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest">{job.status === 'OPEN' ? 'Close Job' : 'Re-open'}</button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
        {activeTab === 'CANDIDATES' && (
          <div className="space-y-8 animate-in fade-in pb-32">
            <header>
              <h2 className="text-3xl font-black text-gray-900">Talent Discovery</h2>
              <select value={selectedJobId || ''} onChange={e => setSelectedJobId(e.target.value)} className="w-full mt-4 p-5 bg-white border border-gray-100 rounded-[1.5rem] font-bold outline-none focus:border-emerald-500 shadow-sm transition-all">
                <option value="">Select an active role...</option>
                {allJobs.filter(j => j.status === 'OPEN').map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </header>
            <div className="grid gap-6">
              {matchedCandidates.length === 0 ? <p className="text-center py-20 text-gray-400 font-bold italic">Select a role to run the matching engine.</p> : matchedCandidates.map(c => (
                <div key={c.seeker.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                   <div className="flex items-center gap-6 text-left">
                     <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-xl text-gray-300 group-hover:text-emerald-500 transition-colors"><UserIcon /></div>
                     <div><p className="text-2xl font-black text-gray-900">{c.seeker.fullName}</p><p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{c.seeker.location.city || c.seeker.location.state}</p></div>
                   </div>
                   <div className={`w-16 h-16 rounded-2xl border-4 flex flex-col items-center justify-center ${c.scoreFinal > 0.8 ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-black' : 'border-gray-100 text-gray-400'}`}>
                      <span className="text-[10px] uppercase opacity-40">Match</span>
                      <span className="text-lg">{(c.scoreFinal * 100).toFixed(0)}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <EmployerBottomNav activeTab={activeTab} onSelect={setActiveTab} isPublishing={isPublishing} />
    </div>
  );
};

export default EmployerDashboard;
