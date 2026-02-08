
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
  { id: '1', name: 'Frontend Development', category: 'Tech' },
  { id: '2', name: 'Backend Development', category: 'Tech' },
  { id: '3', name: 'Mobile App Development', category: 'Tech' },
  { id: '4', name: 'UI/UX Design', category: 'Tech' },
  { id: '5', name: 'IT Support', category: 'Tech' },
  { id: '6', name: 'Masonry', category: 'Construction' },
  { id: '7', name: 'Plumbing', category: 'Construction' },
  { id: '8', name: 'Electrical Installation', category: 'Construction' },
  { id: '9', name: 'Carpentry', category: 'Construction' },
  { id: '10', name: 'Welding', category: 'Construction' },
  { id: '11', name: 'Crop Farming', category: 'Agri' },
  { id: '12', name: 'Poultry Farming', category: 'Agri' },
  { id: '13', name: 'Fish Farming', category: 'Agri' },
  { id: '14', name: 'Farm Equipment Operation', category: 'Agri' },
  { id: '15', name: 'Produce Processing', category: 'Agri' },
  { id: '16', name: 'Community Health Assistance', category: 'Health' },
  { id: '17', name: 'Medical Records', category: 'Health' },
  { id: '18', name: 'Pharmacy Assistance', category: 'Health' },
  { id: '19', name: 'Laboratory Support', category: 'Health' },
  { id: '20', name: 'Home Care Support', category: 'Health' },
  { id: '21', name: 'Truck Driving', category: 'Logistics' },
  { id: '22', name: 'Motorcycle Dispatch', category: 'Logistics' },
  { id: '23', name: 'Vehicle Maintenance', category: 'Logistics' },
  { id: '24', name: 'Logistics Assistance', category: 'Logistics' },
  { id: '25', name: 'Fleet Operations', category: 'Logistics' }
];

// O(1) Lookup Index for Skills - KEYED BY NAME for app-wide consistency
export const SKILL_INDEX = new Map(SKILL_TAXONOMY.map(s => [s.name, s]));

export const SKILL_ALIASES: Record<string, string> = {
  'JS': 'Frontend Development',
  'Javascript': 'Frontend Development',
  'React': 'Frontend Development',
  'MS Word': 'IT Support',
  'Repairman': 'Vehicle Maintenance'
};
