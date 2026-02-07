
import React, { useState, useMemo } from 'react';
import { UserProfile, Education, Experience } from '../../types';
import { SKILL_TAXONOMY, NIGERIA_STATES } from '../../constants';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
  isCompletingProfile?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, isCompletingProfile }) => {
  const [skills, setSkills] = useState<string[]>(user.skills);
  const [state, setState] = useState(user.location.state);
  const [city, setCity] = useState(user.location.city);
  const [education, setEducation] = useState<Education[]>(user.education || []);
  const [experience, setExperience] = useState<Experience[]>(user.experience || []);
  const [skillSearch, setSkillSearch] = useState('');
  
  const toggleSkill = (id: string) => {
    setSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const filteredSkills = useMemo(() => {
    return SKILL_TAXONOMY.filter(s => 
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) || 
      s.category.toLowerCase().includes(skillSearch.toLowerCase())
    );
  }, [skillSearch]);

  const handleSave = () => {
    if (skills.length === 0) {
      alert('Please select at least one skill to get job matches.');
      return;
    }
    if (city.trim() === '') {
      alert('Please enter your current city.');
      return;
    }

    onUpdate({
      ...user,
      skills,
      location: { ...user.location, state, city },
      education,
      experience
    });
    alert('Profile updated! We are now re-computing your best job matches.');
  };

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', year: '' }]);
  };

  const addExperience = () => {
    setExperience([...experience, { company: '', role: '', duration: '' }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  return (
    <div className="fade-in max-w-2xl mx-auto space-y-12 pb-24">
      {isCompletingProfile && (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[2.5rem] flex items-start gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-emerald-900 text-xl">Power Up Your Matching</h3>
            <p className="text-emerald-700/80 text-sm mt-1 leading-relaxed">
              Complete your profile to unlock high-accuracy job matches. Our algorithm weights your <strong>skills</strong> and <strong>location</strong> above all else.
            </p>
          </div>
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Professional Profile</h1>
        <p className="text-gray-500 font-medium">This data drives your matchNG algorithm score.</p>
      </header>

      {/* 1. LOCATION */}
      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black">01</span>
          <h3 className="text-xl font-black text-gray-900">Where are you based?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current State</label>
            <select 
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold"
            >
              {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City / LGA</label>
            <input 
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Yaba, Ikeja, Garki"
              className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold"
            />
          </div>
        </div>
      </section>

      {/* 2. SKILLS */}
      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black">02</span>
            <h3 className="text-xl font-black text-gray-900">What are your skills?</h3>
          </div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{skills.length} Selected</span>
        </div>
        
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search skills (e.g. React, Repair, Farming...)" 
            value={skillSearch}
            onChange={e => setSkillSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition outline-none font-bold text-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto pr-2 no-scrollbar">
          {filteredSkills.map(skill => (
            <button
              key={skill.id}
              onClick={() => toggleSkill(skill.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                skills.includes(skill.id) 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 scale-[1.02]' 
                  : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200'
              }`}
            >
              {skill.name}
            </button>
          ))}
        </div>
      </section>

      {/* 3. EDUCATION */}
      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black">03</span>
            <h3 className="text-xl font-black text-gray-900">Education</h3>
          </div>
          <button onClick={addEducation} className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline">+ Add New</button>
        </div>
        <div className="space-y-4">
          {education.length === 0 && <p className="text-center py-6 text-gray-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-gray-50 rounded-2xl">No education history added.</p>}
          {education.map((edu, idx) => (
            <div key={idx} className="relative bg-gray-50 p-6 rounded-[1.5rem] border border-transparent hover:border-gray-200 transition group">
              <button 
                onClick={() => removeEducation(idx)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Institution</label>
                   <input 
                    placeholder="e.g. University of Lagos" 
                    value={edu.institution} 
                    onChange={e => {
                      const newEdu = [...education];
                      newEdu[idx].institution = e.target.value;
                      setEducation(newEdu);
                    }}
                    className="w-full p-2 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Degree</label>
                   <input 
                    placeholder="e.g. B.Sc Psychology" 
                    value={edu.degree} 
                    onChange={e => {
                      const newEdu = [...education];
                      newEdu[idx].degree = e.target.value;
                      setEducation(newEdu);
                    }}
                    className="w-full p-2 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Year</label>
                   <input 
                    placeholder="e.g. 2021" 
                    value={edu.year} 
                    onChange={e => {
                      const newEdu = [...education];
                      newEdu[idx].year = e.target.value;
                      setEducation(newEdu);
                    }}
                    className="w-full p-2 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EXPERIENCE */}
      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black">04</span>
            <h3 className="text-xl font-black text-gray-900">Experience</h3>
          </div>
          <button onClick={addExperience} className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline">+ Add New</button>
        </div>
        <div className="space-y-4">
          {experience.length === 0 && <p className="text-center py-6 text-gray-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-gray-50 rounded-2xl">No work history added.</p>}
          {experience.map((exp, idx) => (
            <div key={idx} className="relative bg-gray-50 p-6 rounded-[1.5rem] border border-transparent hover:border-gray-200 transition">
              <button 
                onClick={() => removeExperience(idx)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Company</label>
                   <input 
                    placeholder="e.g. Kuda Bank" 
                    value={exp.company} 
                    onChange={e => {
                      const newExp = [...experience];
                      newExp[idx].company = e.target.value;
                      setExperience(newExp);
                    }}
                    className="w-full p-2 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Role</label>
                   <input 
                    placeholder="e.g. Product Analyst" 
                    value={exp.role} 
                    onChange={e => {
                      const newExp = [...experience];
                      newExp[idx].role = e.target.value;
                      setExperience(newExp);
                    }}
                    className="w-full p-2 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Duration</label>
                   <input 
                    placeholder="e.g. 2 years" 
                    value={exp.duration} 
                    onChange={e => {
                      const newExp = [...experience];
                      newExp[idx].duration = e.target.value;
                      setExperience(newExp);
                    }}
                    className="w-full p-2 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-8">
        <button 
          onClick={handleSave}
          className="w-full bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition transform active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {isCompletingProfile ? 'See My Career Matches' : 'Update My Algorithm Score'}
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Profile;
