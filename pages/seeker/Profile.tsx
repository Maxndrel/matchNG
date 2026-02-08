
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Education, Experience } from '../../types.ts';
import { ONBOARDING_MAP, NIGERIA_STATES } from '../../constants.ts';
import { 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Save, 
  Plus, 
  Trash2,
  Target
} from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  // Local state for form management
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    primaryIndustry: user.primaryIndustry || '',
    primarySkill: user.primarySkill || '',
    state: user.location.state,
    city: user.location.city,
    education: user.education || [],
    experience: user.experience || []
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Derived data
  const industries = Object.keys(ONBOARDING_MAP);
  const availableSkills = formData.primaryIndustry 
    ? ONBOARDING_MAP[formData.primaryIndustry].skills 
    : [];

  // Check if form is "dirty" (has changes)
  const isDirty = useMemo(() => {
    return (
      formData.fullName !== user.fullName ||
      formData.primaryIndustry !== user.primaryIndustry ||
      formData.primarySkill !== user.primarySkill ||
      formData.state !== user.location.state ||
      formData.city !== user.location.city ||
      JSON.stringify(formData.education) !== JSON.stringify(user.education || []) ||
      JSON.stringify(formData.experience) !== JSON.stringify(user.experience || [])
    );
  }, [formData, user]);

  // Handlers
  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndustry = e.target.value;
    setFormData(prev => ({
      ...prev,
      primaryIndustry: newIndustry,
      primarySkill: '' // Reset skill when industry changes to maintain consistency
    }));
  };

  const handleSave = async () => {
    if (!formData.primaryIndustry || !formData.primarySkill || !formData.city) {
      alert("Please complete your Industry, Primary Skill, and City.");
      return;
    }

    setIsSaving(true);
    
    const updatedUser: UserProfile = {
      ...user,
      fullName: formData.fullName,
      primaryIndustry: formData.primaryIndustry,
      primarySkill: formData.primarySkill,
      skills: Array.from(new Set([...user.skills, formData.primarySkill])), // Add to search index
      location: {
        ...user.location,
        state: formData.state,
        city: formData.city
      },
      education: formData.education,
      experience: formData.experience
    };

    // Simulate network delay for UX
    await new Promise(r => setTimeout(r, 600));
    
    onUpdate(updatedUser);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', year: '' }]
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', duration: '' }]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-32 animate-in fade-in duration-500">
      
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-in slide-in-from-top-8 duration-300">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-xs font-black uppercase tracking-widest">Profile Synced Successfully</p>
          </div>
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
        <p className="text-gray-500 font-medium">Manage your metadata to improve career match accuracy.</p>
      </header>

      {/* SECTION 1: SECTOR & EXPERTISE */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Sector & Expertise</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Primary Career Path</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Industry</label>
              <select 
                value={formData.primaryIndustry}
                onChange={handleIndustryChange}
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold text-gray-900"
              >
                <option value="" disabled>Select your sector</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Primary Skill {formData.primaryIndustry ? `in ${formData.primaryIndustry}` : ''}
              </label>
              {!formData.primaryIndustry ? (
                <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">Select an industry first</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => setFormData(prev => ({ ...prev, primarySkill: skill }))}
                      className={`p-4 rounded-xl border-2 text-left font-bold transition-all text-sm flex items-center justify-between ${
                        formData.primarySkill === skill 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md' 
                          : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-emerald-200'
                      }`}
                    >
                      {skill}
                      {formData.primarySkill === skill && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: GEOGRAPHY */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Work Location</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Where you are currently based</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
              <select 
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold text-gray-900"
              >
                {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / LGA</label>
              <input 
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="e.g. Ikeja, Maitama"
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROFESSIONAL HISTORY */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 md:p-10 space-y-10">
          
          {/* Experience */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Experience</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Past & Current Roles</p>
                </div>
              </div>
              <button 
                onClick={addExperience}
                className="p-2 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {formData.experience.length === 0 ? (
                <p className="text-center py-8 text-gray-400 font-bold italic text-sm border-2 border-dashed border-gray-50 rounded-3xl">No work history added yet.</p>
              ) : (
                formData.experience.map((exp, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition group relative">
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }))}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Company</label>
                        <input 
                          value={exp.company}
                          onChange={(e) => {
                            const next = [...formData.experience];
                            next[idx].company = e.target.value;
                            setFormData(prev => ({ ...prev, experience: next }));
                          }}
                          className="w-full p-2 bg-white rounded-xl border border-gray-100 font-bold text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Role</label>
                        <input 
                          value={exp.role}
                          onChange={(e) => {
                            const next = [...formData.experience];
                            next[idx].role = e.target.value;
                            setFormData(prev => ({ ...prev, experience: next }));
                          }}
                          className="w-full p-2 bg-white rounded-xl border border-gray-100 font-bold text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Duration</label>
                        <input 
                          value={exp.duration}
                          onChange={(e) => {
                            const next = [...formData.experience];
                            next[idx].duration = e.target.value;
                            setFormData(prev => ({ ...prev, experience: next }));
                          }}
                          className="w-full p-2 bg-white rounded-xl border border-gray-100 font-bold text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-6 pt-6 border-t border-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Education</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Academic Background</p>
                </div>
              </div>
              <button 
                onClick={addEducation}
                className="p-2 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {formData.education.length === 0 ? (
                <p className="text-center py-8 text-gray-400 font-bold italic text-sm border-2 border-dashed border-gray-50 rounded-3xl">No education history added yet.</p>
              ) : (
                formData.education.map((edu, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition group relative">
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }))}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Institution</label>
                        <input 
                          value={edu.institution}
                          onChange={(e) => {
                            const next = [...formData.education];
                            next[idx].institution = e.target.value;
                            setFormData(prev => ({ ...prev, education: next }));
                          }}
                          className="w-full p-2 bg-white rounded-xl border border-gray-100 font-bold text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Degree</label>
                        <input 
                          value={edu.degree}
                          onChange={(e) => {
                            const next = [...formData.education];
                            next[idx].degree = e.target.value;
                            setFormData(prev => ({ ...prev, education: next }));
                          }}
                          className="w-full p-2 bg-white rounded-xl border border-gray-100 font-bold text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Year</label>
                        <input 
                          value={edu.year}
                          onChange={(e) => {
                            const next = [...formData.education];
                            next[idx].year = e.target.value;
                            setFormData(prev => ({ ...prev, education: next }));
                          }}
                          className="w-full p-2 bg-white rounded-xl border border-gray-100 font-bold text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FLOAT ACTION BAR FOR SAVE (MOBILE-FRIENDLY) */}
      <div className="fixed bottom-24 left-0 right-0 px-4 md:px-0 flex justify-center z-40 pointer-events-none">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={`h-16 w-full max-w-md rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all flex items-center justify-center gap-3 pointer-events-auto active:scale-95 ${
            isDirty 
              ? 'bg-gray-900 text-white shadow-emerald-900/10 hover:bg-black' 
              : 'bg-gray-100 text-gray-300 shadow-none cursor-not-allowed grayscale'
          }`}
        >
          {isSaving ? <Save className="w-5 h-5 animate-bounce" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Synchronizing...' : isDirty ? 'Save Career Updates' : 'No Changes Detected'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
