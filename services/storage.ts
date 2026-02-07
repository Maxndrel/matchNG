
import { UserProfile, Job, UserRole, IndustryTrend } from '../types';
import { MOCK_SEEKER, MOCK_EMPLOYER } from './mockData';
import { TREND_DATA, SKILL_TAXONOMY, NIGERIA_STATES, INDUSTRIES } from '../constants';

const KEYS = {
  USERS: 'matchNG_users_v1',
  JOBS: 'matchNG_jobs_v1',
  ACTIVE_USER: 'matchNG_session_v1',
  TRENDS: 'matchNG_trends_v1'
};

/**
 * Reactive Sync Event
 * Dispatched whenever storage is mutated to force UI updates
 */
const notifyStorageChange = () => {
  window.dispatchEvent(new Event('storage-sync'));
};

// Safe JSON Parse wrapper
const safeParse = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Storage Corrupted for key: ${key}`, e);
    return fallback;
  }
};

/**
 * SEEDING & INITIALIZATION
 */
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([MOCK_SEEKER, MOCK_EMPLOYER]));
  }
  
  if (!localStorage.getItem(KEYS.JOBS)) {
    // Procedural generation of 100 jobs for scalability testing
    const baseJobs = generateMockJobs(100);
    localStorage.setItem(KEYS.JOBS, JSON.stringify(baseJobs));
  }

  if (!localStorage.getItem(KEYS.TRENDS)) {
    localStorage.setItem(KEYS.TRENDS, JSON.stringify(TREND_DATA));
  }
  notifyStorageChange();
};

const generateMockJobs = (count: number): Job[] => {
  const titles = ['Software Engineer', 'Farm Manager', 'Solar Installer', 'Accountant', 'Sales Lead'];
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
    createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
    salaryRange: `₦${150 + (i % 5) * 50}k - ₦${250 + (i % 5) * 50}k`
  }));
};

/**
 * CRUD: USERS
 */
export const getUsers = (): UserProfile[] => safeParse(KEYS.USERS, []);

export const saveUser = (user: UserProfile) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx > -1) users[idx] = user;
  else users.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  
  // Sync session if applicable
  const session = getActiveUser();
  if (session?.id === user.id) setActiveUser(user);
  
  notifyStorageChange();
};

/**
 * CRUD: JOBS
 */
export const getJobs = (): Job[] => safeParse(KEYS.JOBS, []);

export const saveJob = (job: Job) => {
  const jobs = getJobs();
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx > -1) jobs[idx] = job;
  else jobs.push(job);
  localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
  notifyStorageChange();
};

/**
 * SESSION MANAGEMENT
 */
export const getActiveUser = (): UserProfile | null => safeParse(KEYS.ACTIVE_USER, null);

export const setActiveUser = (user: UserProfile | null) => {
  if (user) localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(user));
  else localStorage.removeItem(KEYS.ACTIVE_USER);
  notifyStorageChange();
};

/**
 * SYSTEM RESET
 */
export const resetSystem = () => {
  localStorage.clear();
  initializeStorage();
  window.location.reload();
};
