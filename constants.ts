
import { Skill, IndustryTrend } from './types';

export const WEIGHTS = {
  SKILL: 0.5,
  LOCATION: 0.3,
  TREND: 0.2
};

export const NIGERIA_STATES = [
  'Lagos', 'Abuja (FCT)', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Enugu', 'Edo', 'Anambra', 'Bauchi', 'Benue'
];

export const INDUSTRIES = [
  'Technology', 'Agriculture', 'Renewable Energy', 'Manufacturing', 'Retail', 'Education', 'Construction', 'Logistics'
];

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
  { id: '1', name: 'React.js', category: 'Tech' },
  { id: '2', name: 'Python', category: 'Tech' },
  { id: '3', name: 'Generator Repair', category: 'Local' },
  { id: '4', name: 'Vulcanizer', category: 'Local' },
  { id: '5', name: 'Okada Rider', category: 'Logistics' },
  { id: '6', name: 'Digital Marketing', category: 'Marketing' },
  { id: '7', name: 'Plumbing', category: 'Trade' },
  { id: '8', name: 'Electrical Work', category: 'Trade' },
  { id: '9', name: 'Graphic Design', category: 'Creative' },
  { id: '10', name: 'Customer Service', category: 'Soft' }
];

// O(1) Lookup Index for Skills
export const SKILL_INDEX = new Map(SKILL_TAXONOMY.map(s => [s.id, s]));

export const SKILL_ALIASES: Record<string, string> = {
  'JS': 'React.js',
  'Javascript': 'React.js',
  'MS Word': 'Computer Literacy',
  'Repairman': 'Generator Repair'
};
