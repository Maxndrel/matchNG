
import React from 'react';
import { SKILL_TAXONOMY } from '../../constants';
// Added TrendingUp to the lucide-react imports
import { Monitor, Sprout, Sun, ShieldCheck, GraduationCap, TrendingUp } from 'lucide-react';

const Training: React.FC = () => {
  return (
    <div className="fade-in max-w-5xl mx-auto space-y-24 py-12">
      <header className="max-w-2xl">
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Level up your <span className="text-emerald-600">match-ability</span>.</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          The labor market is changing. We partner with Nigeria's top institutions to offer courses that align directly with high-growth industries.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          { title: 'Tech Academy', icon: Monitor, count: '45 Courses', color: 'bg-blue-50 text-blue-600' },
          { title: 'Modern Farming', icon: Sprout, count: '28 Courses', color: 'bg-emerald-50 text-emerald-600' },
          { title: 'Renewable Tech', icon: Sun, count: '15 Courses', color: 'bg-yellow-50 text-yellow-600' }
        ].map(cat => (
          <div key={cat.title} className="bg-white border border-gray-100 p-8 rounded-3xl hover:shadow-xl transition-all cursor-pointer group">
            <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-1">{cat.title}</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{cat.count}</p>
          </div>
        ))}
      </section>

      <section className="space-y-12">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-600" /> Top In-Demand Skills (2025)
        </h2>
        <div className="flex flex-wrap gap-3">
          {SKILL_TAXONOMY.map(skill => (
            <div key={skill.id} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-6 py-3 rounded-2xl font-black text-sm">
              {skill.name}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-900 rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
        <div className="flex-1 space-y-6 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-4xl font-black leading-tight">Partner Institutions</h2>
          <p className="text-blue-200 text-lg">We certify training from Nigeria's most respected bodies to ensure your profile gets the 'Vetted' badge.</p>
        </div>
        <div className="flex-1 bg-white/10 p-10 rounded-3xl border border-white/20 backdrop-blur-sm relative z-10">
           <div className="flex items-center gap-2 mb-4">
             <GraduationCap className="w-5 h-5 text-emerald-400" />
             <h4 className="text-xl font-black">Upcoming Webinar</h4>
           </div>
           <p className="text-sm text-blue-100 mb-6">"How to optimize your profile for the 2025 Agriculture boom."</p>
           <button className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black shadow-lg">Save My Spot</button>
        </div>
      </section>
    </div>
  );
};

export default Training;
