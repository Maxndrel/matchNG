
import { UserProfile, Job, UserRole, IndustryTrend } from '../types';
import { MOCK_SEEKER, MOCK_EMPLOYER } from './mockData';
import { TREND_DATA, SKILL_TAXONOMY, NIGERIA_STATES, INDUSTRIES } from '../constants';

const KEYS = {
  USERS: 'matchNG_users_v1',
  JOBS: 'matchNG_jobs_v1',
  ACTIVE_USER: 'matchNG_session_v1',
  TRENDS: 'matchNG_trends_v1'
};

const _cache = {
  users: [] as UserProfile[],
  jobs: [] as Job[],
  activeUser: null as UserProfile | null,
  isLoaded: false
};

// Internal utility to prevent infinite event loops
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
  const rawActive = localStorage.getItem(KEYS.ACTIVE_USER);

  _cache.users = rawUsers ? JSON.parse(rawUsers) : [MOCK_SEEKER, MOCK_EMPLOYER];
  _cache.jobs = rawJobs ? JSON.parse(rawJobs) : generateMockJobs(100);
  _cache.activeUser = rawActive ? JSON.parse(rawActive) : null;

  if (!rawUsers) persist(KEYS.USERS, _cache.users);
  if (!rawJobs) persist(KEYS.JOBS, _cache.jobs);

  _cache.isLoaded = true;
};

const generateMockJobs = (count: number): Job[] => {
  const titles = ['Software Engineer', 'Farm Manager', 'Solar Installer', 'Accountant', 'Sales Lead'];
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => ({
    id: `j-gen-${i}`,
    employerId: `e-${i % 5}`,
    employerName: i % 2 === 0 ? 'Paystack' : 'MTN Nigeria',
    title: titles[i % titles.length],
    industry: INDUSTRIES[i % INDUSTRIES.length],
    description: `Dynamic job description for generated role #${i}. Looking for high-performing Nigerians.`,
    requiredSkills: [
      SKILL_TAXONOMY[i % 10].id, 
      SKILL_TAXONOMY[(i + 3) % 10].id
    ],
    location: {
      state: NIGERIA_STATES[i % NIGERIA_STATES.length],
      lga: 'Dynamic LGA',
      city: 'Dynamic City',
      lat: 6.5 + (Math.random() * 0.5),
      lon: 3.3 + (Math.random() * 0.5)
    },
    isRemote: i % 4 === 0,
    status: 'OPEN',
    createdAt: new Date(now - (i * 86400000)).toISOString(),
    salaryRange: `₦${150 + (i % 5) * 50}k - ₦${250 + (i % 5) * 50}k`
  }));
};

export const getUsers = (): UserProfile[] => _cache.users;

export const saveUser = (user: UserProfile) => {
  _isInternalUpdate = true;
  const idx = _cache.users.findIndex(u => u.id === user.id);
  if (idx > -1) {
    _cache.users[idx] = { ...user };
  } else {
    _cache.users.push({ ...user });
  }
  
  persist(KEYS.USERS, _cache.users);
  
  // If we are saving the currently active user, update that pointer too
  if (_cache.activeUser?.id === user.id) {
    _cache.activeUser = { ...user };
    persist(KEYS.ACTIVE_USER, user);
  }
  
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const getJobs = (): Job[] => _cache.jobs;

export const saveJob = (job: Job) => {
  _isInternalUpdate = true;
  const idx = _cache.jobs.findIndex(j => j.id === job.id);
  if (idx > -1) _cache.jobs[idx] = { ...job };
  else _cache.jobs.push({ ...job });
  
  persist(KEYS.JOBS, _cache.jobs);
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const getActiveUser = (): UserProfile | null => {
  // Always verify cache against disk if possible for cross-tab sync
  const rawActive = localStorage.getItem(KEYS.ACTIVE_USER);
  if (rawActive) {
    const parsed = JSON.parse(rawActive);
    if (JSON.stringify(_cache.activeUser) !== rawActive) {
      _cache.activeUser = parsed;
    }
  }
  return _cache.activeUser;
};

export const setActiveUser = (user: UserProfile | null) => {
  _isInternalUpdate = true;
  _cache.activeUser = user ? { ...user } : null;
  if (user) {
    persist(KEYS.ACTIVE_USER, user);
  } else {
    localStorage.removeItem(KEYS.ACTIVE_USER);
  }
  _isInternalUpdate = false;
  notifyStorageChange();
};

export const resetSystem = () => {
  localStorage.clear();
  _cache.isLoaded = false;
  initializeStorage();
  window.location.reload();
};
