
import React, { useMemo } from 'react';
import { INDUSTRIES } from '../constants';
import { getJobs } from '../services/storage';
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
      {/* 1. HERO SECTION */}
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

      {/* 2. ENHANCED HOW IT WORKS */}
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

        <div className="bg-gray-50 rounded-[3rem] p-8 md:p-16 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Settings className="w-3 h-3" /> The Secret Sauce
            </div>
            <h3 className="text-4xl font-black text-gray-900 leading-tight">The 3-Factor Scoring Formula</h3>
            <p className="text-gray-600 leading-relaxed">
              General job boards fail in Nigeria because they ignore local commute patterns and shifting sector demands. We solve this with a weighted mathematical model.
            </p>
            <div className="space-y-6">
              {[
                { label: 'Technical & Trade Skills', weight: 50, color: 'bg-emerald-500', icon: Target, desc: 'Normalizes skills across industries.' },
                { label: 'Geographic Compatibility', weight: 30, color: 'bg-blue-500', icon: MapPin, desc: 'Factors in LGA distance & urban density.' },
                { label: 'Industry Trend Multiplier', weight: 20, color: 'bg-purple-500', icon: TrendingUp, desc: 'Boosts roles in high-growth sectors.' }
              ].map((f, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <f.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">{f.label}</span>
                    </div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">{f.weight}% Weight</span>
                  </div>
                  <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-gray-100">
                    <div className={`${f.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${f.weight}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium italic">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-black text-gray-900">USSD Fallback</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Low bandwidth? No problem. Dial <strong>*347*88#</strong> to access matches on any mobile phone.</p>
            </div>
            <div className="bg-emerald-600 p-8 rounded-[2rem] text-white space-y-4 shadow-xl shadow-emerald-100">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-black">Real-time Sync</h4>
              <p className="text-xs text-emerald-100 leading-relaxed">Matches are re-computed hourly to account for new listings and shifting market data.</p>
            </div>
            <div className="sm:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-8">
              <div className="flex-grow">
                <h4 className="font-black text-gray-900 mb-2">Ready to test the engine?</h4>
                <p className="text-xs text-gray-500">Create a profile in under 2 minutes and see your compatibility.</p>
              </div>
              <button onClick={() => onStart('SEEKER')} className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INDUSTRIES */}
      <section className="bg-gray-900 mx-4 px-8 md:px-24 py-24 rounded-[3rem] text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-4xl font-black mb-4">Explore Industries</h2>
            <p className="text-gray-400 max-w-md">Find where you fit best. Our taxonomy covers over 500+ distinct Nigerian job roles.</p>
          </div>
          <button onClick={() => onNavigate('TRAINING')} className="flex items-center gap-2 text-emerald-400 font-bold hover:underline text-sm uppercase tracking-widest">
            View all categories <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INDUSTRIES.map((industry, i) => (
            <div key={i} className="group cursor-pointer bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-emerald-600 hover:border-emerald-600 transition-all">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/20">
                {getIndustryIcon(industry)}
              </div>
              <h4 className="font-bold">{industry}</h4>
              <p className="text-xs text-gray-500 group-hover:text-emerald-100 mt-1">1,200+ Openings</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA */}
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

      {/* 5. FOOTER (Landing Page Only) */}
      <footer className="bg-white pt-32 pb-16 border-t border-gray-100 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            {/* Column 1: Brand */}
            <div className="space-y-6">
              <div onClick={() => onNavigate?.('LANDING')} className="flex items-center gap-2 text-2xl font-black cursor-pointer">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                  <Briefcase className="text-white w-6 h-6" />
                </div>
                <span className="text-gray-900 tracking-tighter font-black">match<span className="text-emerald-600">NG</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-medium">
                The leading labor matching engine for Nigeria's digital and trade economy. Built for impact.
              </p>
              <div className="flex items-center gap-6 pt-2">
                 <div className="flex flex-col">
                   <span className="text-xl font-black text-gray-900">150k+</span>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Seekers</span>
                 </div>
                 <div className="w-px h-8 bg-gray-100"></div>
                 <div className="flex flex-col">
                   <span className="text-xl font-black text-gray-900">450+</span>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Orgs</span>
                 </div>
              </div>
            </div>

            {/* Column 2: Platform */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Platform</h4>
              <ul className="space-y-4">
                <li><button onClick={() => onNavigate?.('ABOUT')} className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>About Us</button></li>
                <li><button onClick={() => onNavigate?.('LANDING')} className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>Jobs</button></li>
                <li><button onClick={() => onNavigate?.('EMPLOYERS')} className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>Employers</button></li>
                <li><button onClick={() => onNavigate?.('TRAINING')} className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>Training</button></li>
              </ul>
            </div>

            {/* Column 3: Help & Support */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Help & Support</h4>
              <ul className="space-y-4">
                <li><button onClick={() => onNavigate?.('CONTACT')} className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-2 group"><HelpCircle className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" /> FAQ</button></li>
                <li><button onClick={() => onNavigate?.('CONTACT')} className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-2 group"><Mail className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" /> Contact</button></li>
                <li><button className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-2 group"><Shield className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" /> Privacy Policy</button></li>
              </ul>
            </div>

            {/* Column 4: Social Links */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Connect With Us</h4>
              <div className="flex flex-col gap-4">
                <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 group transition-all">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform"><Linkedin className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-gray-700">LinkedIn</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 group transition-all">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Twitter className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-gray-700">Twitter/X</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-400 group transition-all">
                  <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform"><Facebook className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-gray-700">Facebook</span>
                </a>
              </div>
            </div>
          </div>

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
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter leading-none">Powered by</span>
                <span className="text-xs font-black text-gray-400 tracking-tighter">matchNG Engine v1.0.4</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
