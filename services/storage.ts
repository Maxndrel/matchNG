
import { UserProfile, Job, UserRole, IndustryTrend, PendingAction, JobApplication, Notification, ApplicationStatus } from '../types';
import { MOCK_SEEKER, MOCK_EMPLOYER } from './mockData';
import { TREND_DATA, SKILL_TAXONOMY, NIGERIA_STATES, INDUSTRIES } from '../constants';

const KEYS = {
  USERS: 'matchNG_users_v1',
  JOBS: 'matchNG_jobs_v1',
  APPLICATIONS: 'matchNG_applications_v1',
  NOTIFICATIONS: 'matchNG_notifications_v1',
  ACTIVE_USER: 'matchNG_session_v1',
  QUEUE: 'matchNG_pending_actions_v1'
};

const _cache = {
  users: [] as UserProfile[],
  jobs: [] as Job[],
  applications: [] as JobApplication[],
  notifications: [] as Notification[],
  activeUser: null as UserProfile | null,
  queue: [] as PendingAction[],
  isLoaded: false
};

let _isInternalUpdate = false;

const notifyStorageChange = () => {
  if (_isInternalUpdate) return;
  window.dispatchEvent(new Event('storage-sync'));
};

const persist = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('matchNG Storage Error:', e);
  }
};

export const initializeStorage = () => {
  if (_cache.isLoaded) return;

  const rawUsers = localStorage.getItem(KEYS.USERS);
  const rawJobs = localStorage.getItem(KEYS.JOBS);
  const rawApps = localStorage.getItem(KEYS.APPLICATIONS);
  const rawNotifs = localStorage.getItem(KEYS.NOTIFICATIONS);
  const rawActive = localStorage.getItem(KEYS.ACTIVE_USER);
  const rawQueue = localStorage.getItem(KEYS.QUEUE);

  _cache.users = rawUsers ? JSON.parse(rawUsers) : [MOCK_SEEKER, MOCK_EMPLOYER];
  _cache.jobs = rawJobs ? JSON.parse(rawJobs) : [];
  _cache.applications = rawApps ? JSON.parse(rawApps) : [];
  _cache.notifications = rawNotifs ? JSON.parse(rawNotifs) : [];
  _cache.activeUser = rawActive ? JSON.parse(rawActive) : null;
  _cache.queue = rawQueue ? JSON.parse(rawQueue) : [];

  if (!rawUsers) persist(KEYS.USERS, _cache.users);
  
  // If no jobs exist, populate with some mock data for development
  if (!rawJobs || _cache.jobs.length === 0) {
    _cache.jobs = generateMockJobs(10);
    persist(KEYS.JOBS, _cache.jobs);
  }

  _cache.isLoaded = true;
};

const generateMockJobs = (count: number): Job[] => {
  const titles = ['Software Engineer', 'Farm Manager', 'Solar Installer', 'Accountant', 'Sales Lead'];
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => ({
    id: `j-gen-${i}`,
    employerId: MOCK_EMPLOYER.id,
    employerName: 'Paystack',
    title: titles[i % titles.length],
    industry: INDUSTRIES[i % INDUSTRIES.length],
    description: `Dynamic job description for role #${i}.`,
    requiredSkills: [SKILL_TAXONOMY[i % 10].id],
    location: { state: 'Lagos', lga: 'Ikeja', city: 'Ikeja', lat: 6.5, lon: 3.3 },
    isRemote: i % 4 === 0,
    status: 'OPEN',
    createdAt: new Date(now - (i * 86400000)).toISOString()
  }));
};

// --- APPLICATION LOGIC ---

export const getApplicationsByEmployer = (employerId: string): JobApplication[] => {
  return _cache.applications.filter(a => a.employerId === employerId);
};

export const getApplicationsBySeeker = (seekerId: string): JobApplication[] => {
  return _cache.applications.filter(a => a.seekerId === seekerId);
};

export const saveApplication = (app: JobApplication) => {
  _isInternalUpdate = true;
  
  // Idempotency: Avoid duplicates
  const exists = _cache.applications.find(a => a.jobId === app.jobId && a.seekerId === app.seekerId);
  if (exists && app.id !== exists.id) {
    _isInternalUpdate = false;
    return;
  }

  const idx = _cache.applications.findIndex(a => a.id === app.id);
  if (idx > -1) {
    _cache.applications[idx] = { ...app };
  } else {
    _cache.applications.push({ ...app });
    
    // Create notification for employer
    addNotification({
      userId: app.employerId,
      title: 'New Application',
      message: `${app.seekerName} applied for your role: ${app.jobTitle}`,
      type: 'APPLICATION',
      linkToTab: 'APPLICATIONS'
    });
  }

  persist(KEYS.APPLICATIONS, _cache.applications);
  _isInternalUpdate = false;
  notifyStorageChange();
};

// --- NOTIFICATION LOGIC ---

export const getNotifications = (userId: string): Notification[] => {
  return _cache.notifications.filter(n => n.userId === userId);
};

export const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
  const newNotif: Notification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  _cache.notifications.unshift(newNotif);
  persist(KEYS.NOTIFICATIONS, _cache.notifications);
  notifyStorageChange();
};

export const markNotifRead = (id: string) => {
  const notif = _cache.notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    persist(KEYS.NOTIFICATIONS, _cache.notifications);
    notifyStorageChange();
  }
};

// --- BASE STORAGE ---

export const getUsers = (): UserProfile[] => _cache.users;
export const getJobs = (): Job[] => _cache.jobs;

export const getJobsByEmployer = (employerId: string): Job[] => {
  return _cache.jobs.filter(j => j.employerId === employerId);
};

export const saveUser = (user: UserProfile) => {
  _isInternalUpdate = true;
  const idx = _cache.users.findIndex(u => u.id === user.id);
  if (idx > -1) _cache.users[idx] = { ...user };
  else _cache.users.push({ ...user });
  persist(KEYS.USERS, _cache.users);
  if (_cache.activeUser?.id === user.id) persist(KEYS.ACTIVE_USER, user);
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const saveJob = (job: Job) => {
  _isInternalUpdate = true;
  const idx = _cache.jobs.findIndex(j => j.id === job.id);
  if (idx > -1) _cache.jobs[idx] = { ...job };
  else _cache.jobs.push({ ...job });
  persist(KEYS.JOBS, _cache.jobs);
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const deleteJob = (jobId: string, employerId: string) => {
  _isInternalUpdate = true;
  _cache.jobs = _cache.jobs.filter(j => !(j.id === jobId && j.employerId === employerId));
  persist(KEYS.JOBS, _cache.jobs);
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const getActiveUser = (): UserProfile | null => {
  const raw = localStorage.getItem(KEYS.ACTIVE_USER);
  return raw ? JSON.parse(raw) : null;
};

export const setActiveUser = (user: UserProfile | null) => {
  _cache.activeUser = user;
  if (user) persist(KEYS.ACTIVE_USER, user);
  else localStorage.removeItem(KEYS.ACTIVE_USER);
  notifyStorageChange();
};

export const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
  const newAction: PendingAction = { ...action, id: `act-${Date.now()}`, timestamp: Date.now(), retryCount: 0 };
  _cache.queue.push(newAction);
  persist(KEYS.QUEUE, _cache.queue);
  notifyStorageChange();
};

export const getPendingActions = () => _cache.queue;
export const removePendingAction = (id: string) => {
  _cache.queue = _cache.queue.filter(a => a.id !== id);
  persist(KEYS.QUEUE, _cache.queue);
};
