
export enum UserRole {
  SEEKER = 'SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
}

export interface Location {
  state: string;
  lga: string;
  city: string;
  lat: number;
  lon: number;
}

export interface IndustryTrend {
  industry: string;
  growthRate: number;
  avgSkillDemand: number;
  trendScore: number;
}

// Added Skill interface
export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  skills: string[];
  location: Location;
  remotePreference: boolean;
  relocatePreference: boolean;
  savedJobIds: string[];
  appliedJobIds: string[];
  education?: Education[];
  experience?: Experience[];
  companyName?: string;
  companyBio?: string;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  industry: string;
  description: string;
  requiredSkills: string[];
  location: Location;
  isRemote: boolean;
  status: 'OPEN' | 'DRAFT' | 'CLOSED';
  createdAt: string;
  salaryRange?: string;
}

export interface MatchResult {
  job: Job;
  scoreSkill: number;
  scoreLocation: number;
  scoreTrend: number;
  scoreFinal: number;
}

export interface CandidateResult {
  seeker: UserProfile;
  scoreSkill: number;
  scoreLocation: number;
  scoreTrend: number;
  scoreFinal: number;
}

// Offline Action Queue Types
export type ActionType = 'APPLY' | 'SAVE_JOB' | 'UPDATE_PROFILE';

export interface PendingAction {
  id: string;
  type: ActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
}
