
export enum UserRole {
  SEEKER = 'SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED'
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
  primaryIndustry?: string;
  primarySkill?: string;
  location: Location;
  remotePreference: boolean;
  relocatePreference: boolean;
  savedJobIds: string[];
  appliedJobIds: string[]; // Kept for legacy compatibility and quick lookups
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

export interface JobApplication {
  id: string;
  jobId: string;
  seekerId: string;
  employerId: string;
  status: ApplicationStatus;
  timestamp: string;
  seekerName: string;
  jobTitle: string;
}

export interface Notification {
  id: string;
  userId: string; // Target user
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'APPLICATION' | 'STATUS_CHANGE' | 'SYSTEM';
  linkToTab?: string;
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

export type ActionType = 'APPLY' | 'SAVE_JOB' | 'UPDATE_PROFILE' | 'UPDATE_APP_STATUS';

export interface PendingAction {
  id: string;
  type: ActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
}
