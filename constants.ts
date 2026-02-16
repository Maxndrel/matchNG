
import { Skill, IndustryTrend } from './types';
import { Cpu, Construction, Sprout, HeartPulse, Truck } from 'lucide-react';

export const WEIGHTS = {
  SKILL: 0.5,
  LOCATION: 0.3,
  TREND: 0.2
};

export const NIGERIA_STATES = [
  'Lagos', 'Abuja (FCT)', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Enugu', 'Edo', 'Anambra', 'Bauchi', 'Benue'
];

export const INDUSTRIES = [
  'Technology', 'Construction', 'Agriculture', 'Healthcare', 'Transportation'
];

export const ONBOARDING_MAP: Record<string, { icon: any, skills: string[] }> = {
  'Technology': {
    icon: Cpu,
    skills: ['Frontend Development', 'Backend Development', 'Mobile App Development', 'UI/UX Design', 'IT Support']
  },
  'Construction': {
    icon: Construction,
    skills: ['Masonry', 'Plumbing', 'Electrical Installation', 'Carpentry', 'Welding']
  },
  'Agriculture': {
    icon: Sprout,
    skills: ['Crop Farming', 'Poultry Farming', 'Fish Farming', 'Farm Equipment Operation', 'Produce Processing']
  },
  'Healthcare': {
    icon: HeartPulse,
    skills: ['Community Health Assistance', 'Medical Records', 'Pharmacy Assistance', 'Laboratory Support', 'Home Care Support']
  },
  'Transportation': {
    icon: Truck,
    skills: ['Truck Driving', 'Motorcycle Dispatch', 'Vehicle Maintenance', 'Logistics Assistance', 'Fleet Operations']
  }
};

export const TREND_DATA: IndustryTrend[] = [
  { industry: 'Technology', growthRate: 0.15, avgSkillDemand: 0.9, trendScore: 0.85 },
  { industry: 'Agriculture', growthRate: 0.12, avgSkillDemand: 0.6, trendScore: 0.75 },
  { industry: 'Renewable Energy', growthRate: 0.18, avgSkillDemand: 0.5, trendScore: 0.82 },
  { industry: 'Manufacturing', growthRate: 0.04, avgSkillDemand: 0.4, trendScore: 0.45 },
  { industry: 'Banking', growthRate: 0.08, avgSkillDemand: 0.7, trendScore: 0.65 }
];

// O(1) Lookup Index for Trends
export const TREND_INDEX = new Map(TREND_DATA.map(t => [t.industry, t.trendScore]));

export const SKILL_TAXONOMY: Skill[] = [
  // Tech
  { id: 't1', name: 'Frontend Development', category: 'Technology' },
  { id: 't2', name: 'Backend Development', category: 'Technology' },
  { id: 't3', name: 'Mobile App Development', category: 'Technology' },
  { id: 't4', name: 'UI/UX Design', category: 'Technology' },
  { id: 't5', name: 'IT Support', category: 'Technology' },
  // Construction
  { id: 'c1', name: 'Masonry', category: 'Construction' },
  { id: 'c2', name: 'Plumbing', category: 'Construction' },
  { id: 'c3', name: 'Electrical Installation', category: 'Construction' },
  { id: 'c4', name: 'Carpentry', category: 'Construction' },
  { id: 'c5', name: 'Welding', category: 'Construction' },
  // Agri
  { id: 'a1', name: 'Crop Farming', category: 'Agriculture' },
  { id: 'a2', name: 'Poultry Farming', category: 'Agriculture' },
  { id: 'a3', name: 'Fish Farming', category: 'Agriculture' },
  { id: 'a4', name: 'Farm Equipment Operation', category: 'Agriculture' },
  { id: 'a5', name: 'Produce Processing', category: 'Agriculture' },
  // Health
  { id: 'h1', name: 'Community Health Assistance', category: 'Healthcare' },
  { id: 'h2', name: 'Medical Records', category: 'Healthcare' },
  { id: 'h3', name: 'Pharmacy Assistance', category: 'Healthcare' },
  { id: 'h4', name: 'Laboratory Support', category: 'Healthcare' },
  { id: 'h5', name: 'Home Care Support', category: 'Healthcare' },
  // Transport
  { id: 'tr1', name: 'Truck Driving', category: 'Transportation' },
  { id: 'tr2', name: 'Motorcycle Dispatch', category: 'Transportation' },
  { id: 'tr3', name: 'Vehicle Maintenance', category: 'Transportation' },
  { id: 'tr4', name: 'Logistics Assistance', category: 'Transportation' },
  { id: 'tr5', name: 'Fleet Operations', category: 'Transportation' }
];

export const SKILL_INDEX = new Map(SKILL_TAXONOMY.map(s => [s.name, s]));

export const SKILL_ALIASES: Record<string, string> = {
  'JS': 'Frontend Development',
  'Javascript': 'Frontend Development',
  'React': 'Frontend Development',
  'Coding': 'Backend Development',
  'MS Word': 'IT Support',
  'Repairman': 'Vehicle Maintenance',
  'Mason': 'Masonry',
  'Doctor Assistant': 'Community Health Assistance'
};
