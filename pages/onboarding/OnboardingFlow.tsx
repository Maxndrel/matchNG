
"use client";

import React, { useState, useEffect } from 'react';
import { ONBOARDING_MAP, NIGERIA_STATES } from '../../constants.ts';
import { UserProfile } from '../../types.ts';
import { 
  ArrowRight, 
  Check, 
  ChevronLeft, 
  Target, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  ShieldCheck,
  Globe,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface OnboardingFlowProps {
  user: UserProfile;
  onComplete: (industry: string, skill: string, location: { state: string, city: string }) => void;
}

type OnboardingStep = 1 | 2 | 3 | 4;

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>(1);
  
  // Persistent local state to handle refreshes mid-onboarding
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(`matchNG_onboarding_draft_${user.id}`);
    if (saved) return JSON.parse(saved);
    
    return {
      state: user.location.state || 'Lagos',
      city: user.location.city || '',
      industry: user.primaryIndustry || '',
      skill: user.primarySkill || ''
    };
  });

  // Persist form data to local storage on every change
  useEffect(() => {
    localStorage.setItem(`matchNG_onboarding_draft_${user.id}`, JSON.stringify(formData));
  }, [formData, user.id]);

  // Step Validations
  const isStep1Valid = formData.state && formData.city.trim().length >= 3;
  const isStep2Valid = !!formData.industry;
  const isStep3Valid = !!formData.skill;

  const industries = Object.keys(ONBOARDING_MAP);
  const currentSkills = formData.industry ? ONBOARDING_MAP[formData.industry].skills : [];

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as OnboardingStep);
    } else {
      localStorage.removeItem(`matchNG_onboarding_draft_${user.id}`);
      onComplete(formData.industry, formData.skill, { state: formData.state, city: formData.city });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as OnboardingStep);
  };

  const handleIndustrySelect = (ind: string) => {
    setFormData(prev => ({ 
      ...prev, 
      industry: ind, 
      skill: '' // MANDATORY: Reset skill if industry changes
    }));
  };

  const renderStepIndicator = () => (
    <div className="w-full max-w-md mx-auto mb-10">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
          Onboarding Process: {step} of 4
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          {Math.round((step / 4) * 100)}% Complete
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s}
            className={`h-full flex-1 transition-all duration-500 ease-out rounded-full ${
              step >= s ? 'bg-emerald-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md text-center mb-8">
        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100 mx-auto mb-6">
          <Lock className="text-white w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Complete Your Profile</h1>
        <p className="text-gray-500 font-medium text-sm mt-2">Finish these 4 steps to unlock your job matches.</p>
      </div>

      {renderStepIndicator()}

      <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-emerald-900/5 p-8 md:p-10 relative overflow-hidden">
        
        {/* STEP 1: LOCATION */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">1. Current Location</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Matches are proximity-based</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <select 
                    value={formData.state}
                    onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                    className="w-full pl-12 pr-4 h-14 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:border-emerald-500 outline-none font-bold text-gray-900 appearance-none transition-all"
                  >
                    {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / LGA</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="w-full pl-12 pr-4 h-14 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:border-emerald-500 outline-none font-bold text-gray-900 transition-all"
                    placeholder="e.g. Ikeja, Maitama"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INDUSTRY */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">2. Career Sector</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select your primary industry</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {industries.map((ind) => {
                const Icon = ONBOARDING_MAP[ind].icon;
                const isSelected = formData.industry === ind;
                return (
                  <button
                    key={ind}
                    onClick={() => handleIndustrySelect(ind)}
                    className={`p-5 rounded-2xl border-2 text-left flex items-center gap-5 transition-all active:scale-[0.98] ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50 shadow-lg' 
                        : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-emerald-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-black">{ind}</span>
                    {isSelected && <CheckCircle2 className="ml-auto w-5 h-5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SKILL */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">3. Primary Skill</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">What is your core expertise?</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
              {currentSkills.map((skill) => {
                const isSelected = formData.skill === skill;
                return (
                  <button
                    key={skill}
                    onClick={() => setFormData(p => ({ ...p, skill }))}
                    className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between active:scale-[0.98] ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50 text-gray-900 shadow-md' 
                        : 'border-gray-50 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <span className="text-sm">{skill}</span>
                    {isSelected && <Check className="w-5 h-5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-1 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Ready to Match</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Confirm your profile data</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Work Area', value: `${formData.city}, ${formData.state}`, icon: MapPin },
                { label: 'Industry', value: formData.industry, icon: Briefcase },
                { label: 'Core Skill', value: formData.skill, icon: Target }
              ].map((item, idx) => (
                <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <item.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight leading-relaxed">
                Profile completed. Your matching dashboard is now being generated.
              </p>
            </div>
          </div>
        )}

        <div className="mt-10 space-y-3">
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 3 && !isStep3Valid)
            }
            className="w-full h-16 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none"
          >
            {step === 4 ? 'Unlock Dashboard' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </button>
          
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous Step
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-2 text-gray-300 select-none">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Strict Access Control Active</span>
      </div>
    </div>
  );
};

export default OnboardingFlow;
