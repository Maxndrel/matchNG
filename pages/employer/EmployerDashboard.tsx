
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserProfile, Job, UserRole, ApplicationStatus, JobApplication, Notification } from '../../types';
import { 
  getJobsByEmployer, 
  getUsers, 
  getApplicationsByEmployer, 
  saveApplication, 
  getNotifications, 
  markNotifRead,
  saveJob
} from '../../services/storage';
import { computeCandidateMatch } from '../../services/matchingEngine';
import { INDUSTRIES, SKILL_INDEX } from '../../constants';
import EmployerBottomNav, { EmployerTabId } from '../../components/EmployerBottomNav';
import { 
  PlusCircle, 
  Users, 
  Inbox, 
  Settings, 
  User as UserIcon, 
  Rocket, 
  Bell, 
  CheckSquare, 
  X, 
  FileText 
} from 'lucide-react';

interface EmployerDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<EmployerTabId>('OVERVIEW');
  const [isMounted, setIsMounted] = useState(false);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [seekers, setSeekers] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const refreshData = useCallback(() => {
    if (typeof window === 'undefined') return;
    setAllJobs(getJobsByEmployer(user.id));
    setSeekers(getUsers().filter(u => u.role === UserRole.SEEKER));
    setApplications(getApplicationsByEmployer(user.id));
    setNotifications(getNotifications(user.id));
  }, [user.id]);

  useEffect(() => {
    refreshData();
    window.addEventListener('storage-sync', refreshData);
    return () => window.removeEventListener('storage-sync', refreshData);
  }, [refreshData]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in pb-32">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-gray-900 leading-none">Kabo, {user.fullName.split(' ')[0]}</h2>
          <p className="text-gray-500 font-medium mt-2">Recruitment Pipeline Pulse</p>
        </div>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-3 rounded-2xl border transition-all relative ${unreadCount > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-gray-100 text-gray-400'}`}
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Jobs</p>
           <h3 className="text-5xl font-black text-gray-900 mt-2">{allJobs.filter(j => j.status === 'OPEN').length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Applications</p>
           <h3 className="text-5xl font-black text-gray-900 mt-2">{applications.length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notifications</p>
           <h3 className="text-5xl font-black text-gray-900 mt-2">{notifications.length}</h3>
        </div>
      </div>

      <main>
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button onClick={() => setActiveTab('POST_JOB')} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-all">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-gray-700">Create Listing</span>
            </button>
            <button onClick={() => setActiveTab('CANDIDATES')} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-all">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-sm text-gray-700">Review Matches</span>
            </button>
          </div>
        )}
      </main>

      <EmployerBottomNav activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  );
};

export default EmployerDashboard;
