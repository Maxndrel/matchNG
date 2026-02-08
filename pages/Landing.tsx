
"use client";

import React from 'react';
import { 
  Target, 
  MapPin, 
  TrendingUp, 
  Briefcase, 
  Zap, 
  Settings, 
  Truck, 
  Cpu, 
  Search, 
  Layers,
  ArrowRight,
  Globe,
  ShieldAlert
} from 'lucide-react';

interface LandingProps {
  onStart: (role: 'SEEKER' | 'EMPLOYER') => void;
  onNavigate: (page: any) => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onNavigate }) => {
  return (
    <div className="fade-in space-y-16 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-8 md:pt-16 px-4">
        <div className="inline-flex mb-6 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 items-center gap-2">
          <Zap className="w-3 h-3 fill-current" /> Nigeria's #1 Matching Engine
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-6 md:mb-8 leading-[1.1]">
          The algorithm that <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">really</span> understands Nigeria.
        </h1>
        <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
          We match Nigerian youth to opportunities using a specialized 3-factor system: Skills, Local Geography, and Industry Trends.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => onStart('SEEKER')}
            className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition-all active:scale-[0.98]"
          >
            I am a Job Seeker
          </button>
          <button 
            onClick={() => onStart('EMPLOYER')}
            className="w-full sm:w-auto px-10 py-5 bg-white text-emerald-700 border-2 border-emerald-100 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all active:scale-[0.98]"
          >
            Post a Job
          </button>
        </div>
      </section>

      {/* How it Works */}
      <section className="space-y-12 md:space-y-24 px-4">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">Vetted for Local Success</h2>
          <p className="text-gray-500 text-sm md:text-lg font-medium">A sophisticated matching pipeline built for the local labor market.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'Job seekers provide skills (including local trades) and location metadata.', icon: Search, color: 'emerald' },
            { step: '02', title: 'Vector Matching', desc: 'Our engine normalizes data, mapping local synonyms to a standard taxonomy.', icon: Cpu, color: 'blue' },
            { step: '03', title: 'Ranked Outcomes', desc: 'Instantly view matches with transparency scores via Web or SMS.', icon: Layers, color: 'purple' }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <item.icon className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">{item.step}</span>
                <div className={`w-8 h-8 rounded-lg bg-${item.color}-50 flex items-center justify-center text-${item.color}-600`}>
                  <item.icon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="px-4">
        <div className="bg-emerald-600 rounded-[3rem] p-8 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-100">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">Ready to find your perfect match?</h2>
            <p className="text-emerald-100 text-base md:text-xl font-medium">Join thousands of Nigerians using data to build their careers.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
               <button onClick={() => onStart('SEEKER')} className="w-full sm:w-auto bg-white text-emerald-700 px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all active:scale-[0.98]">Create Free Profile</button>
               <button onClick={() => onStart('EMPLOYER')} className="w-full sm:w-auto bg-emerald-700 text-white border border-emerald-500 px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-800 transition-all active:scale-[0.98]">Hire Talent</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-32 md:pb-16 border-t border-gray-100 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>&copy; {new Date().getFullYear()} matchNG</span>
              <span className="hidden md:block w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Lagos, Nigeria</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors">
                <Globe className="w-4 h-4" /> English (NG)
              </button>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors">
                Privacy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
