
import React from 'react';

interface EmployersInfoProps {
  onStart: () => void;
}

const EmployersInfo: React.FC<EmployersInfoProps> = ({ onStart }) => {
  return (
    <div className="fade-in max-w-5xl mx-auto space-y-24 py-12">
      <section className="flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <h1 className="text-5xl font-black text-gray-900 leading-tight">Hire vetted Nigerian talent, powered by data.</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Stop sorting through thousands of irrelevant CVs. Our engine identifies the top 1% of compatible candidates based on technical ability and geographic availability.
          </p>
          <button onClick={onStart} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition">
            Post Your First Job
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-4 pt-12">
            <div className="bg-emerald-100 h-48 rounded-3xl flex items-end p-6">
               <span className="text-4xl">👥</span>
            </div>
            <div className="bg-teal-600 h-40 rounded-3xl flex items-end p-6">
               <span className="text-4xl">📊</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-900 h-40 rounded-3xl flex items-end p-6">
               <span className="text-4xl text-white">⚙️</span>
            </div>
            <div className="bg-emerald-500 h-48 rounded-3xl flex items-end p-6">
               <span className="text-4xl text-white">📍</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-12">
        <h2 className="text-3xl font-black text-center">Flexible Plans for Every Business</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              tier: 'Startup', 
              price: '₦25k', 
              features: ['5 Job Posts/mo', 'Basic Analytics', 'Standard Matching'],
              recommended: false
            },
            { 
              tier: 'Enterprise', 
              price: '₦150k', 
              features: ['Unlimited Posts', 'Predictive Trends', 'Priority Support', 'Full API Access'],
              recommended: true
            },
            { 
              tier: 'Government', 
              price: 'Contact Us', 
              features: ['Nationwide Data', 'Labor Market Reporting', 'Custom Fair-Match Filters'],
              recommended: false
            }
          ].map((plan, i) => (
            <div key={i} className={`p-10 rounded-3xl border-2 flex flex-col ${plan.recommended ? 'border-emerald-600 bg-emerald-50 shadow-2xl relative' : 'border-gray-100 bg-white'}`}>
              {plan.recommended && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">Most Popular</span>}
              <h3 className="text-xl font-black mb-2">{plan.tier}</h3>
              <p className="text-3xl font-black text-gray-900 mb-6">{plan.price}<span className="text-sm text-gray-400 font-bold">/month</span></p>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map(f => (
                  <li key={f} className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className={`w-full py-4 rounded-xl font-black transition ${plan.recommended ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-900 text-white hover:bg-black'}`}>
                Choose {plan.tier}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EmployersInfo;
