
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

const isBrowser = typeof window !== 'undefined';

const safeGet = (key: string): any | null => {
  if (!isBrowser) return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

const safeSet = (key: string, data: any) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Fail silently
  }
};

let _isInternalUpdate = false;

const notifyStorageChange = () => {
  if (_isInternalUpdate || !isBrowser) return;
  window.requestAnimationFrame(() => {
    window.dispatchEvent(new Event('storage-sync'));
  });
};

export const initializeStorage = () => {
  if (_cache.isLoaded || !isBrowser) return;

  _cache.users = safeGet(KEYS.USERS) || [MOCK_SEEKER, MOCK_EMPLOYER];
  _cache.jobs = safeGet(KEYS.JOBS) || [];
  _cache.applications = safeGet(KEYS.APPLICATIONS) || [];
  _cache.notifications = safeGet(KEYS.NOTIFICATIONS) || [];
  _cache.activeUser = safeGet(KEYS.ACTIVE_USER) || null;
  _cache.queue = safeGet(KEYS.QUEUE) || [];

  if (!localStorage.getItem(KEYS.USERS)) safeSet(KEYS.USERS, _cache.users);
  
  if (_cache.jobs.length === 0) {
    _cache.jobs = generateMockJobs(10);
    safeSet(KEYS.JOBS, _cache.jobs);
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

export const getApplicationsByEmployer = (employerId: string): JobApplication[] => {
  if (!isBrowser) return [];
  return _cache.applications.filter(a => a.employerId === employerId);
};

export const getApplicationsBySeeker = (seekerId: string): JobApplication[] => {
  if (!isBrowser) return [];
  return _cache.applications.filter(a => a.seekerId === seekerId);
};

export const saveApplication = (app: JobApplication) => {
  if (!isBrowser) return;
  _isInternalUpdate = true;
  const idx = _cache.applications.findIndex(a => a.id === app.id);
  if (idx > -1) _cache.applications[idx] = { ...app };
  else _cache.applications.push({ ...app });

  safeSet(KEYS.APPLICATIONS, _cache.applications);
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const getNotifications = (userId: string): Notification[] => {
  if (!isBrowser) return [];
  return _cache.notifications.filter(n => n.userId === userId);
};

export const markNotifRead = (id: string) => {
  if (!isBrowser) return;
  const notif = _cache.notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    safeSet(KEYS.NOTIFICATIONS, _cache.notifications);
    notifyStorageChange();
  }
};

export const getUsers = (): UserProfile[] => {
  if (!isBrowser) return [];
  if (!_cache.isLoaded) initializeStorage();
  return _cache.users;
};

export const getJobs = (): Job[] => {
  if (!isBrowser) return [];
  if (!_cache.isLoaded) initializeStorage();
  return _cache.jobs;
};

export const getJobsByEmployer = (employerId: string): Job[] => {
  if (!isBrowser) return [];
  return _cache.jobs.filter(j => j.employerId === employerId);
};

export const saveUser = (user: UserProfile) => {
  if (!isBrowser) return;
  _isInternalUpdate = true;
  const idx = _cache.users.findIndex(u => u.id === user.id);
  if (idx > -1) _cache.users[idx] = { ...user };
  else _cache.users.push({ ...user });
  safeSet(KEYS.USERS, _cache.users);
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const saveJob = (job: Job) => {
  if (!isBrowser) return;
  _isInternalUpdate = true;
  const idx = _cache.jobs.findIndex(j => j.id === job.id);
  if (idx > -1) _cache.jobs[idx] = { ...job };
  else _cache.jobs.push({ ...job });
  safeSet(KEYS.JOBS, _cache.jobs);
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const getActiveUser = (): UserProfile | null => {
  if (!isBrowser) return null;
  return safeGet(KEYS.ACTIVE_USER);
};

export const setActiveUser = (user: UserProfile | null) => {
  if (!isBrowser) return;
  _cache.activeUser = user;
  if (user) safeSet(KEYS.ACTIVE_USER, user);
  else localStorage.removeItem(KEYS.ACTIVE_USER);
  notifyStorageChange();
};

export const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
  if (!isBrowser) return;
  const newAction: PendingAction = { ...action, id: `act-${Date.now()}`, timestamp: Date.now(), retryCount: 0 };
  _cache.queue.push(newAction);
  safeSet(KEYS.QUEUE, _cache.queue);
  notifyStorageChange();
};

export const getPendingActions = () => {
  if (!isBrowser) return [];
  return _cache.queue;
};

export const removePendingAction = (id: string) => {
  if (!isBrowser) return;
  _cache.queue = _cache.queue.filter(a => a.id !== id);
  safeSet(KEYS.QUEUE, _cache.queue);
  notifyStorageChange();
};
