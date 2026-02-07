
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="fade-in max-w-4xl mx-auto space-y-20 py-12">
      <header className="text-center space-y-6">
        <h1 className="text-5xl font-black text-gray-900">Bridging the Gap</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          matchNG is Nigeria's premier labor matching engine, built to solve the systematic inefficiencies in the youth employment market.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-2xl font-black mb-4 text-emerald-600">Our Mission</h3>
          <p className="text-gray-600 leading-relaxed">
            To provide every Nigerian youth with accessible, high-precision job matching that respects their unique location, localized skills, and career aspirations.
          </p>
        </div>
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-2xl font-black mb-4 text-teal-600">Our Vision</h3>
          <p className="text-gray-600 leading-relaxed">
            A Nigeria where geographic distance and informational asymmetry are no longer barriers to sustainable economic opportunity.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 p-12 rounded-[2.5rem] border border-gray-100">
        <h3 className="text-3xl font-black text-gray-900 mb-12 text-center">Impact Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Youth Matched', value: '150k+' },
            { label: 'States Covered', value: '36' },
            { label: 'Partner Orgs', value: '450' },
            { label: 'Success Rate', value: '82%' }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-black text-emerald-600 mb-1">{stat.value}</p>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <h3 className="text-3xl font-black text-gray-900">Key Partners</h3>
        <div className="flex flex-wrap gap-12 items-center opacity-60">
           <span className="text-2xl font-black italic">Ministry of Labor</span>
           <span className="text-2xl font-black italic">UNDP Nigeria</span>
           <span className="text-2xl font-black italic">SMEDAN</span>
           <span className="text-2xl font-black italic">Google for Startups</span>
        </div>
      </section>
    </div>
  );
};

export default About;
