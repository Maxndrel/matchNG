
import React from 'react';
import { 
  Monitor, 
  Sprout, 
  Sun, 
  ShieldCheck, 
  GraduationCap, 
  TrendingUp,
  BarChart4,
  Target,
  Rocket,
  ArrowUpRight
} from 'lucide-react';

const Training: React.FC = () => {
  return (
    <div className="fade-in max-w-5xl mx-auto space-y-24 py-12 px-4">
      <header className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
           <Rocket className="w-3 h-3" /> Career Growth v2.0
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">Level up your <span className="text-emerald-600">match-ability</span>.</h1>
        <p className="text-xl text-gray-600 leading-relaxed font-medium">
          The Nigerian labor market is moving fast. We don't just find you jobs; we give you the data and training roadmaps to stay ahead of the curve.
        </p>
      </header>

      {/* Feature Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          { 
            title: 'Real-Time Insights', 
            desc: 'Access live salary benchmarks and industry growth rates based on thousands of Nigerian job posts.', 
            icon: BarChart4, 
            color: 'bg-emerald-600' 
          },
          { 
            title: 'Skill Gap DNA', 
            desc: 'Our engine identifies exactly what technical skills you are missing compared to top-tier roles.', 
            icon: Target, 
            color: 'bg-blue-600' 
          },
          { 
            title: 'Verified Partners', 
            desc: 'Courses from verified Nigerian and international institutions that sync directly with your match score.', 
            icon: ShieldCheck, 
            color: 'bg-gray-900' 
          }
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
             <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-4">{item.title}</h3>
             <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <TrendingUp className="w-8 h-8 text-emerald-600" /> High-Growth Sector Roadmaps
           </h2>
           <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center gap-2">
             View All 250+ Courses <ArrowUpRight className="w-3 h-3" />
           </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Tech Academy', icon: Monitor, count: '45 Courses', color: 'bg-blue-50 text-blue-600', sub: 'Cloud, Web, AI' },
            { title: 'Modern Farming', icon: Sprout, count: '28 Courses', color: 'bg-emerald-50 text-emerald-600', sub: 'Mechanization, Logistics' },
            { title: 'Energy Tech', icon: Sun, count: '15 Courses', color: 'bg-yellow-50 text-yellow-600', sub: 'Solar, Grid Management' }
          ].map(cat => (
            <div key={cat.title} className="bg-white border border-gray-100 p-8 rounded-3xl hover:border-emerald-200 transition-all cursor-pointer group">
              <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{cat.title}</h3>
              <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-1">{cat.count}</p>
              <p className="text-gray-400 text-xs font-medium mt-3">{cat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Institution Banner */}
      <section className="bg-gray-900 rounded-[3.5rem] p-12 md:p-24 text-white relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">Certified for the local labor market.</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                We partner with Nigeria's most respected training bodies like <strong>Utiva</strong>, <strong>ALX</strong>, and the <strong>Ministry of Labour</strong> to ensure your certifications carry weight with real employers.
              </p>
              <div className="flex gap-4">
                 <button className="bg-emerald-600 px-8 py-4 rounded-2xl font-black hover:bg-emerald-700 transition shadow-xl shadow-emerald-900/40">Become a Partner</button>
              </div>
           </div>
           
           <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <GraduationCap className="w-6 h-6 text-white" />
                 </div>
                 <h4 className="text-xl font-black">Success Spotlight</h4>
              </div>
              <blockquote className="text-xl font-medium leading-relaxed italic text-gray-300">
                "Following the Solar Maintenance roadmap on matchNG helped me get hired at TotalEnergies in Port Harcourt within 3 weeks."
              </blockquote>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                 <div>
                    <p className="text-sm font-black">Tunde Okonjo</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Energy Specialist</p>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>
    </div>
  );
};

export default Training;
