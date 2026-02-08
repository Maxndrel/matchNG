
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Job, CandidateResult, UserRole } from '../../types';
import { getJobs, getUsers, saveJob } from '../../services/storage';
import { computeCandidateMatch } from '../../services/matchingEngine';
import { INDUSTRIES, SKILL_TAXONOMY, NIGERIA_STATES } from '../../constants';
import EmployerBottomNav, { EmployerTabId } from '../../components/EmployerBottomNav';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListFilter, 
  Users, 
  Inbox, 
  Settings, 
  TrendingUp, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Globe,
  Trash2,
  ChevronRight
} from 'lucide-react';

interface EmployerDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<EmployerTabId>(() => {
    const saved = localStorage.getItem('matchNG_employer_tab');
    return (saved as EmployerTabId) || 'OVERVIEW';
  });

  useEffect(() => {
    localStorage.setItem('matchNG_employer_tab', activeTab);
  }, [activeTab]);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Job Post State
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    industry: INDUSTRIES[0],
    description: '',
    requiredSkills: [],
    location: { state: 'Lagos', lga: '', city: '', lat: 6.5, lon: 3.3 },
    isRemote: false,
    status: 'OPEN'
  });

  const allJobs = useMemo(() => getJobs(), [activeTab]);
  const employerJobs = useMemo(() => allJobs.filter(j => j.employerId === user.id), [allJobs, user.id]);
  const seekers = useMemo(() => getUsers().filter(u => u.role === UserRole.SEEKER), []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || newJob.requiredSkills?.length === 0) {
      alert('Please provide a title and at least one required skill.');
      return;
    }

    setIsPublishing(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const jobToSave: Job = {
      ...newJob as Job,
      id: `j-${Date.now()}`,
      employerId: user.id,
      employerName: user.companyName || user.fullName,
      createdAt: new Date().toISOString(),
      status: 'OPEN'
    };

    saveJob(jobToSave);
    setIsPublishing(false);
    setActiveTab('LISTINGS');
    setNewJob({
      title: '',
      industry: INDUSTRIES[0],
      description: '',
      requiredSkills: [],
      location: { state: 'Lagos', lga: '', city: '', lat: 6.5, lon: 3.3 },
      isRemote: false,
      status: 'OPEN'
    });
  };

  const matchedCandidates = useMemo(() => {
    if (!selectedJobId) return [];
    const job = employerJobs.find(j => j.id === selectedJobId);
    if (!job) return [];
    return seekers
      .map(s => computeCandidateMatch(job, s))
      .sort((a, b) => b.scoreFinal - a.scoreFinal);
  }, [selectedJobId, employerJobs, seekers]);

  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <header>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ekaabo, {user.fullName.split(' ')[0]}</h2>
              <p className="text-gray-500 font-medium">Managing {user.companyName || 'your'} hiring pipeline.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-emerald-200 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Listings</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-5xl font-black text-emerald-600">{employerJobs.filter(j => j.status === 'OPEN').length}</h3>
                  <span className="text-xs font-bold text-emerald-500 mb-2">Live</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-blue-200 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Applicants</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-5xl font-black text-blue-600">42</h3>
                  <span className="text-xs font-bold text-blue-400 mb-2">Engaged</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-purple-200 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Interviews</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-5xl font-black text-purple-600">5</h3>
                  <span className="text-xs font-bold text-purple-400 mb-2">Scheduled</span>
                </div>
              </div>
            </div>
            
            <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative group">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-grow space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                    <TrendingUp className="w-3 h-3" /> Market Intelligence
                  </div>
                  <h3 className="text-3xl font-black leading-tight">Demand for <span className="text-emerald-400">Solar Techs</span> is rising in Kaduna.</h3>
                  <p className="text-gray-400 text-lg max-w-xl">Our matching engine suggests adjusting your offer to stay competitive in the current talent landscape.</p>
                  <button onClick={() => setActiveTab('POST_JOB')} className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900">Post Trending Role</button>
                </div>
              </div>
            </section>
          </div>
        );

      case 'POST_JOB':
        return (
          <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
            <header className="text-center space-y-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Create New Listing</h2>
              <p className="text-gray-500">Provide clear requirements to ensure high-accuracy matching.</p>
            </header>

            <form onSubmit={handlePostJob} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-10 mb-24">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">01</div>
                  <h3 className="text-xl font-black">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Title</label>
                    <input 
                      required
                      placeholder="e.g. Senior Frontend Developer"
                      value={newJob.title}
                      onChange={e => setNewJob({...newJob, title: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Industry Sector</label>
                    <select 
                      value={newJob.industry}
                      onChange={e => setNewJob({...newJob, industry: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold"
                    >
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe the role and your company culture..."
                    value={newJob.description}
                    onChange={e => setNewJob({...newJob, description: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">02</div>
                  <h3 className="text-xl font-black">Required Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_TAXONOMY.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        const skills = newJob.requiredSkills || [];
                        setNewJob({
                          ...newJob, 
                          requiredSkills: skills.includes(skill.id) 
                            ? skills.filter(s => s !== skill.id) 
                            : [...skills, skill.id]
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                        newJob.requiredSkills?.includes(skill.id)
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                          : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">03</div>
                  <h3 className="text-xl font-black">Geography & Modality</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Work State</label>
                    <select 
                      value={newJob.location?.state}
                      onChange={e => setNewJob({...newJob, location: {...newJob.location!, state: e.target.value}})}
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold"
                    >
                      {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mt-6">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="font-bold text-sm">Remote Position</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setNewJob({...newJob, isRemote: !newJob.isRemote})}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${newJob.isRemote ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${newJob.isRemote ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isPublishing}
                className={`w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition transform active:scale-95 flex items-center justify-center gap-3 ${isPublishing ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isPublishing ? 'Broadcasting...' : 'Broadcast to Algorithm'}
              </button>
            </form>
          </div>
        );

      case 'LISTINGS':
        return (
          <div className="space-y-8 animate-in fade-in">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Your Listings</h2>
                <p className="text-gray-500 font-medium">Tracking {employerJobs.length} positions.</p>
              </div>
            </header>

            {employerJobs.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest">You haven't posted any jobs yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 pb-24">
                {employerJobs.map(job => (
                  <div key={job.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-emerald-200 transition-all">
                    <div className="flex-grow space-y-2 text-left w-full">
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors">{job.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location.city || job.location.state}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        {job.isRemote && <span className="flex items-center gap-1 text-blue-500"><Globe className="w-3.5 h-3.5" /> Remote</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setActiveTab('CANDIDATES');
                        }}
                        className="flex-grow md:flex-none bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" /> View Matches
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'CANDIDATES':
        return (
          <div className="space-y-8 animate-in fade-in">
            <header className="flex flex-col gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Talent Engine</h2>
                <p className="text-gray-500">Discover compatibles for your openings.</p>
              </div>
              <select value={selectedJobId || ''} onChange={e => setSelectedJobId(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-2xl font-bold text-sm outline-none shadow-sm focus:border-emerald-500">
                <option value="">Select a job to match...</option>
                {employerJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </header>

            {!selectedJobId ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Select a job listing to see compatible talent.</p>
              </div>
            ) : (
              <div className="grid gap-6 pb-24">
                {matchedCandidates.slice(0, 10).map(cand => (
                  <div key={cand.seeker.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center group hover:border-emerald-200 transition-all">
                    <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h4 className="text-2xl font-black">{cand.seeker.fullName}</h4>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-gray-500 font-bold text-sm">{cand.seeker.location.city || cand.seeker.location.state}</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-20 h-20 rounded-[2rem] border-4 border-emerald-500 flex flex-col items-center justify-center bg-emerald-50">
                          <span className="text-[10px] font-black leading-none uppercase text-emerald-800 opacity-60">Match</span>
                          <span className="text-2xl font-black text-emerald-900">{(cand.scoreFinal * 100).toFixed(0)}%</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'APPLICATIONS':
        return (
          <div className="space-y-8 animate-in fade-in">
             <header>
               <h2 className="text-3xl font-black text-gray-900">Applicant Inbox</h2>
               <p className="text-gray-500 font-medium">Managing interest across your active listings.</p>
             </header>
             <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm mb-24">
               <div className="divide-y divide-gray-100">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="p-8 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer group">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400">CO</div>
                        <div className="text-left">
                          <p className="font-black text-gray-900 group-hover:text-emerald-600 transition-colors text-sm">Chidi Okeke applied for Frontend Engineer</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">2 hours ago • Confidence: 94%</p>
                        </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                   </div>
                 ))}
               </div>
             </div>
          </div>
        );

      case 'SETTINGS':
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in pb-24">
            <header>
              <h2 className="text-3xl font-black text-gray-900">Org Settings</h2>
              <p className="text-gray-500 font-medium">Manage your company profile and team access.</p>
            </header>
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10">
              <div className="space-y-6 text-left">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Profile</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Display Name</label>
                    <input className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold" value={user.companyName || user.fullName} readOnly />
                  </div>
                </div>
              </div>
              <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black">Save Changes</button>
            </div>
          </div>
        );

      default:
        return <div className="py-20 text-center font-black uppercase tracking-widest text-gray-400">Module under construction</div>;
    }
  };

  return (
    <div className="relative pt-8 lg:pt-16 min-h-screen">
      <main className="min-w-0 max-w-5xl mx-auto px-4">
        {renderContent()}
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
