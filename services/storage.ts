
import { UserProfile, Job, UserRole, PendingAction, JobApplication, Notification } from '../types.ts';
import { generateSeedJobs } from './jobSeeder.ts';

/**
 * PRODUCTION STORAGE ENGINE v1.2.2
 * Features: Encryption, Versioning, Scaled Dataset Seeding.
 */

const STORAGE_VERSION = 1;
const PREFIX = 'matchNG:v1:';

const isBrowser = typeof window !== 'undefined';

// --- ENCRYPTION (LIGHTWEIGHT OBFUSCATION) ---
const obfuscate = (str: string) => isBrowser ? btoa(encodeURIComponent(str)) : str;
const deobfuscate = (str: string) => isBrowser ? decodeURIComponent(atob(str)) : str;

const SENSITIVE_KEYS = ['fullName', 'email', 'companyBio'];

const processSensitives = (data: any, action: 'hide' | 'reveal'): any => {
  if (!data || typeof data !== 'object') return data;
  const processed = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in processed) {
    if (SENSITIVE_KEYS.includes(key) && typeof processed[key] === 'string') {
      processed[key] = action === 'hide' ? obfuscate(processed[key]) : deobfuscate(processed[key]);
    } else if (typeof processed[key] === 'object') {
      processed[key] = processSensitives(processed[key], action);
    }
  }
  return processed;
};

// --- CORE ENGINE ---

interface StorageEnvelope<T> {
  version: number;
  timestamp: number;
  data: T;
}

export async function setItem<T>(key: string, data: T): Promise<void> {
  if (!isBrowser) return;
  try {
    const processedData = processSensitives(data, 'hide');
    const envelope: StorageEnvelope<T> = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: processedData
    };
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(envelope));
    window.dispatchEvent(new Event('storage-sync'));
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.error("LocalStorage quota exceeded! Attempting partial cleanup...");
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.includes(':drafts:')) localStorage.removeItem(k);
      }
    }
    throw e;
  }
}

export async function getItem<T>(key: string): Promise<T | null> {
  if (!isBrowser) return null;
  const raw = localStorage.getItem(`${PREFIX}${key}`);
  if (!raw) return null;

  try {
    let envelope: StorageEnvelope<T> = JSON.parse(raw);
    return processSensitives(envelope.data, 'reveal');
  } catch (e) {
    console.error(`Storage corruption at key: ${key}`, e);
    return null;
  }
}

export const getStorageUsage = () => {
  if (!isBrowser) return 0;
  let total = 0;
  for (const x in localStorage) {
    if (x.startsWith(PREFIX)) {
      total += ((localStorage[x].length + x.length) * 2);
    }
  }
  return Math.min(100, (total / (1024 * 1024 * 5)) * 100);
};

// --- DOMAIN LOGIC ---

export const initializeStorage = async () => {
  if (!isBrowser) return;
  
  const users = await getItem<UserProfile[]>('users');
  if (!users) {
    // START WITH CLEAN SLATE: No preset profiles.
    await setItem('users', []);
  }
  
  const jobs = await getItem<Job[]>('jobs');
  if (!jobs || jobs.length < 800) {
    console.log("Seeding Production Job Records...");
    const seedJobs = generateSeedJobs();
    try {
      await setItem('jobs', seedJobs);
    } catch (e) {
      console.warn("Seeding failed due to quota. Reducing seed size...");
      await setItem('jobs', seedJobs.slice(0, 400));
    }
  }
};

export const getJobsByEmployer = async (employerId: string): Promise<Job[]> => {
  const jobs = await getItem<Job[]>('jobs') || [];
  return jobs.filter(j => j.employerId === employerId);
};

export const getApplicationsByEmployer = async (employerId: string): Promise<JobApplication[]> => {
  const apps = await getItem<JobApplication[]>('applications') || [];
  return apps.filter(a => a.employerId === employerId);
};

export const saveApplication = async (app: JobApplication): Promise<void> => {
  const apps = await getItem<JobApplication[]>('applications') || [];
  const idx = apps.findIndex(a => a.id === app.id);
  if (idx > -1) apps[idx] = app;
  else apps.push(app);
  await setItem('applications', apps);
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const notes = await getItem<Notification[]>('notifications') || [];
  return notes.filter(n => n.userId === userId);
};

export const markNotifRead = async (id: string): Promise<void> => {
  const notes = await getItem<Notification[]>('notifications') || [];
  const idx = notes.findIndex(n => n.id === id);
  if (idx > -1) {
    notes[idx].isRead = true;
    await setItem('notifications', notes);
  }
};

export const getUsers = async (): Promise<UserProfile[]> => {
  return await getItem<UserProfile[]>('users') || [];
};

export const getJobs = async (): Promise<Job[]> => {
  return await getItem<Job[]>('jobs') || [];
};

export const saveUser = async (user: UserProfile): Promise<void> => {
  const users = await getItem<UserProfile[]>('users') || [];
  const idx = users.findIndex(u => u.id === user.id);
  if (idx > -1) users[idx] = user;
  else users.push(user);
  await setItem('users', users);
  
  const active = getActiveUser();
  if (active && active.id === user.id) {
    setActiveUser(user);
  }
};

export const saveJob = async (job: Job): Promise<void> => {
  const jobs = await getItem<Job[]>('jobs') || [];
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx > -1) jobs[idx] = job;
  else jobs.push(job);
  await setItem('jobs', jobs);
};

export const getActiveUser = (): UserProfile | null => {
  if (!isBrowser) return null;
  const raw = localStorage.getItem(`${PREFIX}session`);
  if (!raw) return null;
  try {
    const envelope = JSON.parse(raw);
    return processSensitives(envelope.data, 'reveal');
  } catch { return null; }
};

export const setActiveUser = (user: UserProfile | null) => {
  if (!isBrowser) return;
  if (user) setItem('session', user);
  else localStorage.removeItem(`${PREFIX}session`);
  window.dispatchEvent(new Event('storage-sync'));
};

export const addPendingAction = async (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
  const queue = await getItem<PendingAction[]>('queue') || [];
  const newAction: PendingAction = { ...action, id: `act-${Date.now()}`, timestamp: Date.now(), retryCount: 0 };
  queue.push(newAction);
  await setItem('queue', queue);
};

export const getPendingActions = async (): Promise<PendingAction[]> => {
  return await getItem<PendingAction[]>('queue') || [];
};

export const removePendingAction = async (id: string) => {
  const queue = await getItem<PendingAction[]>('queue') || [];
  const filtered = queue.filter(a => a.id !== id);
  await setItem('queue', filtered);
};
