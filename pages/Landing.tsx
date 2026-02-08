"use client";

import React, { useMemo } from 'react';
import { INDUSTRIES } from '../constants';
import { 
  Target, 
  MapPin, 
  TrendingUp, 
  ChevronRight, 
  Briefcase, 
  Zap, 
  Settings, 
  Truck, 
  Cpu, 
  Smartphone, 
  Search, 
  Layers,
  ArrowRight,
  Linkedin,
  Twitter,
  Facebook,
  Globe,
  Shield,
  HelpCircle,
  Mail
} from 'lucide-react';

interface LandingProps {
  onStart: (role: 'SEEKER' | 'EMPLOYER') => void;
  onNavigate: (page: any) => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onNavigate }) => {
  const getIndustryIcon = (name: string) => {
    switch (name) {
      case 'Technology': return <Zap className="w-5 h-5" />;
      case 'Logistics': return <Truck className="w-5 h-5" />;
      case 'Manufacturing': return <Settings className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <div className="fade-in space-y-32">
      <section className="text-center max-w-4xl mx-auto pt-16 px-4">
        <div className="inline-block mb-6 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
          🚀 Nigeria's #1 Matching Engine
        </div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tight text-gray-900 mb-8 leading-[1.1]">
          The algorithm that <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">really</span> understands Nigeria.
        </h1>
        <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          We match Nigerian youth to opportunities using a specialized 3-factor system: Skills, Local Geography, and Industry Trends.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => onStart('SEEKER')}
            className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition transform hover:-translate-y-1"
          >
            I am a Job Seeker
          </button>
          <button 
            onClick={() => onStart('EMPLOYER')}
            className="px-10 py-5 bg-white text-emerald-700 border-2 border-emerald-100 rounded-2xl font-black text-lg hover:bg-emerald-50 transition transform hover:-translate-y-1"
          >
            Post a Job
          </button>
        </div>
      </section>

      <section className="space-y-24 px-4">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">How matchNG Works</h2>
          <p className="text-gray-500 text-lg">A sophisticated matching pipeline built for the local labor market.</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {[
              { step: '01', title: 'Data Ingestion', desc: 'Job seekers provide skills (including local trades) and location. Employers post detailed requirements.', icon: Search, color: 'blue' },
              { step: '02', title: 'Vector Matching', desc: 'Our engine normalizes data, mapping local synonyms (e.g. "Okada" to "Logistics") to a standard taxonomy.', icon: Cpu, color: 'emerald' },
              { step: '03', title: 'Ranked Outcomes', desc: 'Instantly view matches with transparency scores. Access results via Web, SMS, or USSD.', icon: Layers, color: 'purple' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className={`w-16 h-16 mb-6 rounded-2xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{item.step}</span>
                  <h3 className="text-xl font-black text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-600 mx-4 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl font-black leading-tight">Ready to find your perfect match?</h2>
          <p className="text-emerald-100 text-xl font-medium">Join thousands of Nigerians using data to build their careers.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
             <button onClick={() => onStart('SEEKER')} className="bg-white text-emerald-700 px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-50 shadow-2xl transition transform active:scale-95">Create Free Profile</button>
             <button onClick={() => onStart('EMPLOYER')} className="bg-emerald-700 text-white border border-emerald-500 px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-800 transition transform active:scale-95">Hire Talent</button>
          </div>
        </div>
      </section>

      <footer className="bg-white pt-32 pb-16 border-t border-gray-100 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span>&copy; {new Date().getFullYear()} matchNG</span>
              <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Lagos, Nigeria</span>
            </div>
            <div className="flex items-center gap-8">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors">
                <Globe className="w-4 h-4" /> English (NG)
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;