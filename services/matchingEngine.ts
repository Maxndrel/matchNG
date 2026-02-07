
import { Job, UserProfile, MatchResult, CandidateResult } from '../types';
import { WEIGHTS, TREND_INDEX, SKILL_ALIASES } from '../constants';

/**
 * PREPROCESSING
 */
export const normalizeSkills = (skills: string[]): string[] => {
  // Use a simple loop for maximum speed
  const result = [];
  for (let i = 0; i < skills.length; i++) {
    result.push(SKILL_ALIASES[skills[i]] || skills[i]);
  }
  return result;
};

/**
 * MATCHING & SCORING
 */

// Skill Score: Binary Cosine Similarity
// Memoization is handled by the caller to avoid garbage collection of Sets
export const calculateSkillScore = (seekerSkills: Set<string>, jobSkills: string[]): number => {
  if (jobSkills.length === 0 || seekerSkills.size === 0) return 0;
  
  let dotProduct = 0;
  for (let i = 0; i < jobSkills.length; i++) {
    if (seekerSkills.has(jobSkills[i])) {
      dotProduct++;
    }
  }
  
  const magnitude = Math.sqrt(seekerSkills.size) * Math.sqrt(jobSkills.length);
  return dotProduct / magnitude;
};

export const calculateLocationScore = (seeker: UserProfile, job: Job): number => {
  if (job.isRemote) return 1.0;
  
  const sLoc = seeker.location;
  const jLoc = job.location;
  
  if (sLoc.state === jLoc.state) {
    if (sLoc.city.toLowerCase() === jLoc.city.toLowerCase()) return 1.0;
    return seeker.relocatePreference ? 0.7 : 0.4;
  }
  
  return seeker.relocatePreference ? 0.2 : 0.05;
};

export const calculateTrendScore = (industry: string): number => {
  // TREND_INDEX is a Map: O(1) lookup
  return TREND_INDEX.get(industry) || 0.4;
};

/**
 * RANKING ENGINE
 */
export const getRecommendations = (seeker: UserProfile, allJobs: Job[]): MatchResult[] => {
  const seekerSkillSet = new Set(seeker.skills);
  const results: MatchResult[] = [];

  for (let i = 0; i < allJobs.length; i++) {
    const job = allJobs[i];
    
    // 1. FAST PRUNING (Early Exit)
    if (job.status !== 'OPEN') continue;
    
    const isRemote = job.isRemote;
    const isSameState = job.location.state === seeker.location.state;
    
    if (!isRemote && !isSameState && !seeker.relocatePreference) continue;

    // 2. HEAVY MATH (Only for pruned subset)
    const scoreSkill = calculateSkillScore(seekerSkillSet, job.requiredSkills);
    const scoreLocation = calculateLocationScore(seeker, job);
    const scoreTrend = calculateTrendScore(job.industry);
    
    const scoreFinal = (WEIGHTS.SKILL * scoreSkill) + 
                       (WEIGHTS.LOCATION * scoreLocation) + 
                       (WEIGHTS.TREND * scoreTrend);
    
    results.push({
      job,
      scoreSkill,
      scoreLocation,
      scoreTrend,
      scoreFinal: Math.round(scoreFinal * 100) / 100
    });
  }

  // 3. SORT (Ranked)
  return results.sort((a, b) => b.scoreFinal - a.scoreFinal);
};

export const computeMatch = (seeker: UserProfile, job: Job): MatchResult => {
  const seekerSkillSet = new Set(seeker.skills);
  const scoreSkill = calculateSkillScore(seekerSkillSet, job.requiredSkills);
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
  const seekerSkillSet = new Set(seeker.skills);
  const scoreSkill = calculateSkillScore(seekerSkillSet, job.requiredSkills);
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
