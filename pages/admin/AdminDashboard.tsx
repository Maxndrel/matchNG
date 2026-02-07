
import React, { useMemo } from 'react';
import { TREND_DATA } from '../../constants';
import { getUsers, getJobs } from '../../services/storage';
import { UserRole } from '../../types';

const AdminDashboard: React.FC = () => {
  const users = useMemo(() => getUsers(), []);
  const jobs = useMemo(() => getJobs(), []);

  const seekerCount = users.filter(u => u.role === UserRole.SEEKER).length;
  const employerCount = users.filter(u => u.role === UserRole.EMPLOYER).length;

  return (
    <div className="fade-in space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">National Labor Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time matching trends and industry growth metrics.</p>
        </div>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 hover:bg-gray-200 transition">
          Export Report (.CSV)
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Registered Seekers', value: seekerCount, trend: '+12%', color: 'emerald' },
          { label: 'Active Job Posts', value: jobs.length, trend: '+5%', color: 'emerald' },
          { label: 'Employers Joined', value: employerCount, trend: '+8%', color: 'teal' },
          { label: 'Matching Efficiency', value: '72%', trend: '+15%', color: 'teal' }
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-t-4 ${stat.color === 'emerald' ? 'border-t-emerald-500' : 'border-t-teal-500'}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
            <p className={`text-xs font-bold ${stat.color === 'emerald' ? 'text-emerald-600' : 'text-teal-600'} mt-1`}>{stat.trend} this month</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Industry Growth Trends</h3>
          <div className="space-y-4">
            {TREND_DATA.map((t, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{t.industry}</span>
                  <span className="font-bold text-emerald-600">{(t.growthRate * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${t.growthRate * 500}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Fairness Guardrails</h3>
          <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mb-6">
            <p className="text-xs font-bold text-teal-800 uppercase mb-1">Urban vs Rural Analysis</p>
            <p className="text-sm text-teal-700">Urban matching is currently 12% more accurate than rural matching. Applying "Rural Boost" filter automatically.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Auto-Skill Normalization</span>
              <span className="w-10 h-6 bg-teal-500 rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Bias-Correction Algorithm</span>
              <span className="w-10 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
