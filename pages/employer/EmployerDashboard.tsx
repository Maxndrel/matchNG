
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserProfile, Job, UserRole, MatchResult, CandidateResult } from '../../types';
import { getJobs, getUsers, saveJob, saveUser, getActiveUser, getJobsByEmployer, deleteJob } from '../../services/storage';
import { computeCandidateMatch } from '../../services/matchingEngine';
import { INDUSTRIES, SKILL_TAXONOMY, NIGERIA_STATES, SKILL_INDEX } from '../../constants';
import EmployerBottomNav, { EmployerTabId } from '../../components/EmployerBottomNav';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListFilter, 
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
  ChevronRight,
  MoreVertical,
  Check,
  X,
  FileText,
  Save,
  Rocket,
  Briefcase,
  ExternalLink
} from 'lucide-react';

interface EmployerDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

const QUICK_ACTIONS = [
  { id: 'POST_JOB', label: 'Create Listing', icon: PlusCircle, color: 'text-emerald-600' },
  { id: 'CANDIDATES', label: 'Review Matches', icon: Users, color: 'text-blue-600' },
  { id: 'SETTINGS', label: 'Company Profile', icon: Settings, color: 'text-gray-600' }
];

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<EmployerTabId>(() => {
    const saved = localStorage.getItem('matchNG_employer_tab');
    return (saved as EmployerTabId) || 'OVERVIEW';
  });

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [seekers, setSeekers] = useState<UserProfile[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobListingFilter, setJobListingFilter] = useState<'OPEN' | 'DRAFT' | 'CLOSED'>('OPEN');
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [postStep, setPostStep] = useState(1);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    industry: INDUSTRIES[0],
    description: '',
    requiredSkills: [],
    location: { state: 'Lagos', lga: '', city: '', lat: 6.5, lon: 3.3 },
    isRemote: false,
    status: 'OPEN'
  });

  // -----------------------------------------------------------------------------
  // DATA LOAD & SYNC
  // -----------------------------------------------------------------------------
  const refreshData = useCallback(() => {
    setAllJobs(getJobsByEmployer(user.id));
    setSeekers(getUsers().filter(u => u.role === UserRole.SEEKER));
  }, [user.id]);

  useEffect(() => {
    refreshData();
    window.addEventListener('storage-sync', refreshData);
    return () => window.removeEventListener('storage-sync', refreshData);
  }, [refreshData]);

  // Derived calculations
  const stats = useMemo(() => {
    const active = allJobs.filter(j => j.status === 'OPEN').length;
    const drafts = allJobs.filter(j => j.status === 'DRAFT').length;
    const employerJobIds = new Set(allJobs.map(j => j.id));
    const applicants = seekers.filter(s => s.appliedJobIds.some(id => employerJobIds.has(id))).length;
    return { active, drafts, applicants };
  }, [allJobs, seekers]);

  const matchedCandidates = useMemo(() => {
    if (!selectedJobId) return [];
    const job = allJobs.find(j => j.id === selectedJobId);
    if (!job) return [];
    return seekers
      .map(s => computeCandidateMatch(job, s))
      .sort((a, b) => b.scoreFinal - a.scoreFinal);
  }, [selectedJobId, allJobs, seekers]);

  // Helper to count applicants for a specific job
  const getJobApplicantCount = (jobId: string) => {
    return seekers.filter(s => s.appliedJobIds.includes(jobId)).length;
  };

  // -----------------------------------------------------------------------------
  // HANDLERS
  // -----------------------------------------------------------------------------
  const handlePostJob = async (status: 'OPEN' | 'DRAFT' = 'OPEN') => {
    if (status === 'OPEN' && (!newJob.title || newJob.requiredSkills?.length === 0)) {
      alert('Please complete the job title and select at least one skill.');
      return;
    }

    setIsPublishing(true);
    await new Promise(r => setTimeout(r, 1000));

    const jobToSave: Job = {
      ...newJob as Job,
      id: newJob.id || `j-${Date.now()}`,
      employerId: user.id,
      employerName: user.companyName || user.fullName,
      createdAt: new Date().toISOString(),
      status: status
    };

    saveJob(jobToSave);
    setIsPublishing(false);
    setActiveTab('LISTINGS');
    setPostStep(1);
    setNewJob({ title: '', industry: INDUSTRIES[0], description: '', requiredSkills: [], location: { state: 'Lagos', lga: '', city: '', lat: 6.5, lon: 3.3 }, isRemote: false, status: 'OPEN' });
  };

  const handleStatusChange = (jobId: string, newStatus: 'OPEN' | 'CLOSED' | 'DRAFT') => {
    const job = allJobs.find(j => j.id === jobId);
    if (job) {
      saveJob({ ...job, status: newStatus });
    }
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure? This will remove the listing and all its candidate data permanently.')) {
      deleteJob(jobId, user.id);
    }
  };

  // -----------------------------------------------------------------------------
  // RENDERERS
  // -----------------------------------------------------------------------------
  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kabo, {user.fullName.split(' ')[0]}</h2>
          <p className="text-gray-500 font-medium">Managing <strong>{allJobs.length}</strong> postings for your organization.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Live Pulse</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Published', val: stats.active, icon: Rocket, color: 'emerald' },
          { label: 'Total Applicants', val: stats.applicants, icon: Inbox, color: 'blue' },
          { label: 'Saved Drafts', val: stats.drafts, icon: FileText, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all cursor-pointer" onClick={() => setActiveTab('LISTINGS')}>
             <div className="relative z-10 flex flex-col justify-between h-24">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
               <h3 className="text-5xl font-black text-gray-900">{stat.val}</h3>
             </div>
             <stat.icon className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.03] text-${stat.color}-600 group-hover:scale-110 transition-transform duration-700`} />
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(action => (
            <button 
              key={action.id}
              onClick={() => setActiveTab(action.id as EmployerTabId)}
              className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              <div className={`p-3 rounded-2xl bg-gray-50 ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {allJobs.length === 0 && (
        <section className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-emerald-900">Broadcasting starts here</h4>
              <p className="text-emerald-700/70 text-sm font-medium">Post your first requirement to see candidates matched by our algorithm.</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('POST_JOB')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">Post a Job</button>
        </section>
      )}
    </div>
  );

  const renderListings = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Job Inventory</h2>
          <p className="text-gray-500 font-medium">Viewing <strong>{jobListingFilter.toLowerCase()}</strong> roles posted by you.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {(['OPEN', 'DRAFT', 'CLOSED'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setJobListingFilter(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${jobListingFilter === f ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6">
        {allJobs.filter(j => j.status === jobListingFilter).length === 0 ? (
          <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest mb-4">No roles in {jobListingFilter.toLowerCase()} state.</p>
            {jobListingFilter !== 'OPEN' && (
              <button onClick={() => setJobListingFilter('OPEN')} className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">View Active Roles</button>
            )}
          </div>
        ) : (
          allJobs.filter(j => j.status === jobListingFilter).map(job => {
            const applicants = getJobApplicantCount(job.id);
            return (
              <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-emerald-200 transition-all relative overflow-hidden">
                {/* Visual indicator for active jobs with applicants */}
                {job.status === 'OPEN' && applicants > 0 && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                )}
                
                <div className="flex-grow space-y-2 w-full">
                  <div className="flex items-center gap-3">
                     <h4 className="text-2xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors">{job.title}</h4>
                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                       job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                       job.status === 'DRAFT' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                       'bg-gray-50 text-gray-400 border-gray-100'
                     }`}>
                       {job.status}
                     </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location.state}</span>
                    <span className="flex items-center gap-1.5"><Inbox className="w-3.5 h-3.5" /> {applicants} Applicants</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {job.status === 'OPEN' ? (
                    <>
                      <button 
                        onClick={() => { setSelectedJobId(job.id); setActiveTab('CANDIDATES'); }}
                        className="flex-grow md:flex-none bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 shadow-emerald-100"
                      >
                        <Users className="w-4 h-4" /> View Matches
                      </button>
                      <button 
                        onClick={() => handleStatusChange(job.id, 'CLOSED')}
                        className="p-3.5 rounded-2xl border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                        title="Close Listing"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : job.status === 'CLOSED' ? (
                    <>
                      <button 
                        onClick={() => handleStatusChange(job.id, 'OPEN')}
                        className="flex-grow md:flex-none bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Rocket className="w-4 h-4" /> Re-publish
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-3.5 rounded-2xl border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleStatusChange(job.id, 'OPEN')}
                        className="flex-grow md:flex-none bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-emerald-100"
                      >
                        <CheckCircle className="w-4 h-4" /> Publish Now
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-3.5 rounded-2xl border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Use existing renderers for other tabs but wrapped in main UI
  return (
    <div className="min-h-screen bg-gray-50 pt-8 lg:pt-16">
      <main className="max-w-6xl mx-auto px-4">
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'LISTINGS' && renderListings()}
        {activeTab === 'POST_JOB' && (
          <div className="animate-in fade-in duration-500">
             {/* Note: I'm reusing the existing step logic for brevity but ensuring it saves to THIS employer */}
             <div className="max-w-3xl mx-auto space-y-12 pb-32">
                <header className="text-center space-y-2">
                  <h2 className="text-4xl font-black text-gray-900">Broadcasting Hub</h2>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${postStep === s ? 'w-12 bg-emerald-600' : 'w-6 bg-gray-200'}`}></div>
                    ))}
                  </div>
                </header>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-10 space-y-12">
                  {postStep === 1 && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">01</div>
                         <h3 className="text-2xl font-black">Identify the Role</h3>
                       </div>
                       <div className="space-y-6">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Title</label>
                           <input 
                            value={newJob.title}
                            onChange={e => setNewJob({...newJob, title: e.target.value})}
                            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold text-lg transition-all" 
                            placeholder="e.g. Lead Solar Technician" 
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Industry Sector</label>
                           <select 
                            value={newJob.industry}
                            onChange={e => setNewJob({...newJob, industry: e.target.value})}
                            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold transition-all"
                           >
                             {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                           </select>
                         </div>
                       </div>
                    </div>
                  )}

                  {postStep === 2 && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">02</div>
                         <h3 className="text-2xl font-black">Algorithm Filter (Skills)</h3>
                       </div>
                       <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2">
                          {SKILL_TAXONOMY.map(skill => (
                            <button
                              key={skill.id}
                              onClick={() => {
                                const skills = newJob.requiredSkills || [];
                                setNewJob({...newJob, requiredSkills: skills.includes(skill.id) ? skills.filter(s => s !== skill.id) : [...skills, skill.id]});
                              }}
                              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                                newJob.requiredSkills?.includes(skill.id) 
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                                  : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200'
                              }`}
                            >
                              {skill.name}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {postStep === 3 && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">03</div>
                         <h3 className="text-2xl font-black">Geography & Modality</h3>
                       </div>
                       <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work State</label>
                           <select 
                            value={newJob.location?.state}
                            onChange={e => setNewJob({...newJob, location: {...newJob.location!, state: e.target.value}})}
                            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold transition-all"
                           >
                             {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                         </div>
                         <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl mt-6 border-2 border-transparent">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-blue-500" />
                              <span className="font-bold">Remote Allowed</span>
                            </div>
                            <button 
                              onClick={() => setNewJob({...newJob, isRemote: !newJob.isRemote})}
                              className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${newJob.isRemote ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${newJob.isRemote ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                         </div>
                       </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-8">
                     {postStep > 1 && (
                       <button onClick={() => setPostStep(postStep - 1)} className="px-8 py-4 rounded-2xl font-black border-2 border-gray-100 text-gray-400 hover:bg-gray-50 transition-all">Previous</button>
                     )}
                     {postStep < 3 ? (
                       <button 
                        onClick={() => setPostStep(postStep + 1)} 
                        className="flex-grow bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all"
                       >
                         Next Stage
                       </button>
                     ) : (
                       <div className="flex-grow flex gap-4">
                         <button 
                          onClick={() => handlePostJob('DRAFT')}
                          className="flex-grow bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
                         >
                           <Save className="w-5 h-5" /> Save Draft
                         </button>
                         <button 
                          onClick={() => handlePostJob('OPEN')}
                          disabled={isPublishing}
                          className="flex-grow bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-2xl shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                         >
                           {isPublishing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Rocket className="w-5 h-5" />}
                           Publish Live
                         </button>
                       </div>
                     )}
                  </div>
                </div>
             </div>
          </div>
        )}
        {activeTab === 'CANDIDATES' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-32">
            <header className="flex flex-col gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Talent Engine</h2>
                <p className="text-gray-500 font-medium">Real-time compatibility scores for your vacancies.</p>
              </div>
              <select 
                value={selectedJobId || ''} 
                onChange={e => setSelectedJobId(e.target.value)} 
                className="w-full p-5 bg-white border-2 border-gray-100 rounded-[1.5rem] font-bold outline-none shadow-sm focus:border-emerald-500 transition-all"
              >
                <option value="">Select a listing to filter seekers...</option>
                {allJobs.filter(j => j.status === 'OPEN').map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </header>
            {!selectedJobId ? (
              <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
                <Users className="w-12 h-12 text-gray-100 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest">Select an active listing to generate match reports.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {matchedCandidates.length === 0 ? (
                  <div className="py-20 text-center text-gray-400">No candidates matched the minimum thresholds.</div>
                ) : (
                  matchedCandidates.slice(0, 15).map(cand => (
                    <div key={cand.seeker.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-emerald-200 transition-all">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <UserIcon className="w-8 h-8 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <div className="flex-grow text-center md:text-left space-y-1">
                        <h4 className="text-2xl font-black text-gray-900 leading-none">{cand.seeker.fullName}</h4>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{cand.seeker.location.city || cand.seeker.location.state}</p>
                      </div>
                      <div className={`w-20 h-20 rounded-[2rem] border-4 flex flex-col items-center justify-center transition-all duration-700 ${cand.scoreFinal > 0.8 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white'}`}>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">Match</span>
                        <span className={`text-2xl font-black ${cand.scoreFinal > 0.8 ? 'text-emerald-900' : 'text-gray-900'}`}>{(cand.scoreFinal * 100).toFixed(0)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {/* Placeholder for other tabs */}
        {activeTab === 'APPLICATIONS' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-gray-900 mb-8">Recent Submissions</h2>
            {stats.applicants === 0 ? (
              <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
                <Inbox className="w-12 h-12 text-gray-100 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest">No applications received yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                {seekers.filter(s => s.appliedJobIds.some(id => allJobs.map(ej => ej.id).includes(id))).map((seeker, i) => (
                  <div key={seeker.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-gray-50/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-6 w-full text-left">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0">
                          {seeker.fullName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                          <p className="font-black text-gray-900 group-hover:text-emerald-700 transition-colors">{seeker.fullName}</p>
                          <p className="text-sm font-bold text-gray-400">{seeker.appliedJobIds.length} total applications</p>
                      </div>
                    </div>
                    <button className="flex-grow md:flex-none px-6 py-3 bg-white border border-gray-100 rounded-xl font-bold text-xs hover:border-emerald-200 transition-all shadow-sm">Review Folder</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'SETTINGS' && (
          <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
             <header>
               <h2 className="text-3xl font-black text-gray-900 tracking-tight">Organization Profile</h2>
               <p className="text-gray-500 font-medium tracking-tight">Manage identity and infrastructure settings.</p>
             </header>
             <div className="space-y-6">
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-black tracking-tight uppercase">Public Identity</h3>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                        <input className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold" value={user.companyName || user.fullName} readOnly />
                      </div>
                   </div>
                </div>
             </div>
             <button className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all">Synchronize Settings</button>
          </div>
        )}
      </main>
      <EmployerBottomNav 
        activeTab={activeTab} 
        onSelect={setActiveTab} 
        isPublishing={isPublishing} 
      />
    </div>
  );
};

export default EmployerDashboard;
