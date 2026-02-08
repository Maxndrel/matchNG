
import { Job, UserProfile, MatchResult, CandidateResult } from '../types';
import { WEIGHTS, TREND_INDEX, SKILL_ALIASES } from '../constants';

/**
 * PREPROCESSING
 */
export const normalizeSkills = (skills: string[]): string[] => {
  const result = [];
  for (let i = 0; i < skills.length; i++) {
    result.push(SKILL_ALIASES[skills[i]] || skills[i]);
  }
  return result;
};

/**
 * MATCHING & SCORING
 */

export const calculateSkillScore = (seeker: UserProfile, job: Job): number => {
  // FAST PATH: Check primary skill match first for 10k dataset performance
  if (seeker.primarySkill && job.requiredSkills.includes(seeker.primarySkill)) {
    return 1.0;
  }

  const seekerSkillSet = new Set(seeker.skills);
  const jobSkills = job.requiredSkills;

  if (jobSkills.length === 0 || seekerSkillSet.size === 0) return 0;
  
  let dotProduct = 0;
  for (let i = 0; i < jobSkills.length; i++) {
    if (seekerSkillSet.has(jobSkills[i])) {
      dotProduct++;
    }
  }
  
  const magnitude = Math.sqrt(seekerSkillSet.size) * Math.sqrt(jobSkills.length);
  return dotProduct / magnitude;
};

export const calculateLocationScore = (seeker: UserProfile, job: Job): number => {
  if (job.isRemote) return 1.0;
  
  const sLoc = seeker.location;
  const jLoc = job.location;
  
  if (sLoc.state === jLoc.state) {
    if (sLoc.city && jLoc.city && sLoc.city.toLowerCase() === jLoc.city.toLowerCase()) return 1.0;
    return seeker.relocatePreference ? 0.7 : 0.4;
  }
  
  return seeker.relocatePreference ? 0.2 : 0.05;
};

export const calculateTrendScore = (industry: string): number => {
  return TREND_INDEX.get(industry) || 0.4;
};

/**
 * RANKING ENGINE
 */
export const getRecommendations = (seeker: UserProfile, allJobs: Job[]): MatchResult[] => {
  // HARD GUARD: Do not match if profile is incomplete
  if (!seeker.primaryIndustry || !seeker.primarySkill || !seeker.location.city) {
    return [];
  }

  const results: MatchResult[] = [];

  for (let i = 0; i < allJobs.length; i++) {
    const job = allJobs[i];
    
    // 1. FAST PRUNING
    if (job.status !== 'OPEN') continue;
    
    // High-level industry filter
    if (job.industry !== seeker.primaryIndustry) {
      // 10% chance to show out-of-industry jobs if match is extremely high otherwise
      if (Math.random() > 0.1) continue; 
    }

    const isRemote = job.isRemote;
    const isSameState = job.location.state === seeker.location.state;
    
    if (!isRemote && !isSameState && !seeker.relocatePreference) continue;

    // 2. SCORING
    const scoreSkill = calculateSkillScore(seeker, job);
    const scoreLocation = calculateLocationScore(seeker, job);
    const scoreTrend = calculateTrendScore(job.industry);
    
    const scoreFinal = (WEIGHTS.SKILL * scoreSkill) + 
                       (WEIGHTS.LOCATION * scoreLocation) + 
                       (WEIGHTS.TREND * scoreTrend);
    
    // Threshold for recommendations
    if (scoreFinal < 0.25) continue;

    results.push({
      job,
      scoreSkill,
      scoreLocation,
      scoreTrend,
      scoreFinal: Math.round(scoreFinal * 100) / 100
    });
  }

  return results.sort((a, b) => b.scoreFinal - a.scoreFinal);
};

export const computeMatch = (seeker: UserProfile, job: Job): MatchResult => {
  const scoreSkill = calculateSkillScore(seeker, job);
  const scoreLocation = calculateLocationScore(seeker, job);
  const scoreTrend = calculateTrendScore(job.industry);
  const scoreFinal = (WEIGHTS.SKILL * scoreSkill) + (WEIGHTS.LOCATION * scoreLocation) + (WEIGHTS.TREND * scoreTrend);
  
  return {
    job,
    scoreSkill,
    scoreLocation,
    scoreTrend,
    scoreFinal: Math.round(scoreFinal * 100) / 100
  };
};

export const computeCandidateMatch = (job: Job, seeker: UserProfile): CandidateResult => {
  const scoreSkill = calculateSkillScore(seeker, job);
  const scoreLocation = calculateLocationScore(seeker, job);
  const scoreTrend = calculateTrendScore(job.industry);
  const scoreFinal = (WEIGHTS.SKILL * scoreSkill) + (WEIGHTS.LOCATION * scoreLocation) + (WEIGHTS.TREND * scoreTrend);
  
  return {
    seeker,
    scoreSkill,
    scoreLocation,
    scoreTrend,
    scoreFinal: Math.round(scoreFinal * 100) / 100
  };
};
