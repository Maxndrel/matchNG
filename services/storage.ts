
import { UserProfile, Job, UserRole, PendingAction, JobApplication, Notification } from '../types.ts';
import { MOCK_SEEKER, MOCK_EMPLOYER } from './mockData.ts';
import { SKILL_TAXONOMY, INDUSTRIES } from '../constants.ts';

const KEYS = {
  USERS: 'matchNG_users_v1',
  JOBS: 'matchNG_jobs_v1',
  APPLICATIONS: 'matchNG_applications_v1',
  NOTIFICATIONS: 'matchNG_notifications_v1',
  ACTIVE_USER: 'matchNG_session_v1',
  QUEUE: 'matchNG_pending_actions_v1'
};

const isBrowser = typeof window !== 'undefined';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    console.error('Storage error:', e);
  }
};

export const initializeStorage = async () => {
  if (!isBrowser) return;
  
  // Simulate DB boot up
  await delay(100);

  if (!localStorage.getItem(KEYS.USERS)) {
    safeSet(KEYS.USERS, [MOCK_SEEKER, MOCK_EMPLOYER]);
  }
  
  const existingJobs = safeGet(KEYS.JOBS);
  if (!existingJobs || existingJobs.length === 0) {
    const mockJobs = generateMockJobs(15);
    safeSet(KEYS.JOBS, mockJobs);
  }
  
  window.dispatchEvent(new Event('storage-sync'));
};

const generateMockJobs = (count: number): Job[] => {
  const titles = ['Software Engineer', 'Farm Manager', 'Solar Installer', 'Accountant', 'Sales Lead', 'Project Manager', 'Data Analyst'];
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => ({
    id: `j-gen-${i}`,
    employerId: MOCK_EMPLOYER.id,
    employerName: i % 2 === 0 ? 'Paystack' : 'Flutterwave',
    title: titles[i % titles.length],
    industry: INDUSTRIES[i % INDUSTRIES.length],
    description: `Join our team to help build the future of ${INDUSTRIES[i % INDUSTRIES.length]} in Nigeria. We are looking for dedicated professionals to join our growing team.`,
    requiredSkills: [SKILL_TAXONOMY[i % 10].id, SKILL_TAXONOMY[(i + 1) % 10].id],
    location: { state: 'Lagos', lga: 'Ikeja', city: 'Ikeja', lat: 6.5, lon: 3.3 },
    isRemote: i % 3 === 0,
    status: 'OPEN',
    createdAt: new Date(now - (i * 86400000)).toISOString()
  }));
};

// Added missing getJobsByEmployer function
export const getJobsByEmployer = async (employerId: string): Promise<Job[]> => {
  await delay(200);
  const jobs: Job[] = safeGet(KEYS.JOBS) || [];
  return jobs.filter(j => j.employerId === employerId);
};

export const getApplicationsByEmployer = async (employerId: string): Promise<JobApplication[]> => {
  await delay(200);
  const apps: JobApplication[] = safeGet(KEYS.APPLICATIONS) || [];
  return apps.filter(a => a.employerId === employerId);
};

export const saveApplication = async (app: JobApplication): Promise<void> => {
  await delay(400); // Simulate network overhead
  const apps: JobApplication[] = safeGet(KEYS.APPLICATIONS) || [];
  const idx = apps.findIndex(a => a.id === app.id);
  if (idx > -1) apps[idx] = app;
  else apps.push(app);
  safeSet(KEYS.APPLICATIONS, apps);
  window.dispatchEvent(new Event('storage-sync'));
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(150);
  const notes: Notification[] = safeGet(KEYS.NOTIFICATIONS) || [];
  return notes.filter(n => n.userId === userId);
};

// Added missing markNotifRead function
export const markNotifRead = async (id: string): Promise<void> => {
  const notes: Notification[] = safeGet(KEYS.NOTIFICATIONS) || [];
  const idx = notes.findIndex(n => n.id === id);
  if (idx > -1) {
    notes[idx].isRead = true;
    safeSet(KEYS.NOTIFICATIONS, notes);
    window.dispatchEvent(new Event('storage-sync'));
  }
};

export const getUsers = async (): Promise<UserProfile[]> => {
  await delay(300);
  return safeGet(KEYS.USERS) || [];
};

export const getJobs = async (): Promise<Job[]> => {
  await delay(350);
  return safeGet(KEYS.JOBS) || [];
};

export const saveUser = async (user: UserProfile): Promise<void> => {
  await delay(500);
  const users: UserProfile[] = safeGet(KEYS.USERS) || [];
  const idx = users.findIndex(u => u.id === user.id);
  if (idx > -1) users[idx] = user;
  else users.push(user);
  safeSet(KEYS.USERS, users);
  
  // Update session if it's the active user
  const active = getActiveUser();
  if (active && active.id === user.id) {
    setActiveUser(user);
  }
  
  window.dispatchEvent(new Event('storage-sync'));
};

export const saveJob = async (job: Job): Promise<void> => {
  await delay(400);
  const jobs: Job[] = safeGet(KEYS.JOBS) || [];
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx > -1) jobs[idx] = job;
  else jobs.push(job);
  safeSet(KEYS.JOBS, jobs);
  window.dispatchEvent(new Event('storage-sync'));
};

export const getActiveUser = (): UserProfile | null => {
  return safeGet(KEYS.ACTIVE_USER);
};

export const setActiveUser = (user: UserProfile | null) => {
  if (user) safeSet(KEYS.ACTIVE_USER, user);
  else localStorage.removeItem(KEYS.ACTIVE_USER);
  window.dispatchEvent(new Event('storage-sync'));
};

export const addPendingAction = async (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
  const queue: PendingAction[] = safeGet(KEYS.QUEUE) || [];
  const newAction: PendingAction = { ...action, id: `act-${Date.now()}`, timestamp: Date.now(), retryCount: 0 };
  queue.push(newAction);
  safeSet(KEYS.QUEUE, queue);
  window.dispatchEvent(new Event('storage-sync'));
};

export const getPendingActions = (): PendingAction[] => {
  return safeGet(KEYS.QUEUE) || [];
};

export const removePendingAction = (id: string) => {
  const queue: PendingAction[] = safeGet(KEYS.QUEUE) || [];
  const filtered = queue.filter(a => a.id !== id);
  safeSet(KEYS.QUEUE, filtered);
  window.dispatchEvent(new Event('storage-sync'));
};
