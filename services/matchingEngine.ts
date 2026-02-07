
import { Job, UserProfile, MatchResult, CandidateResult } from '../types';
import { WEIGHTS, TREND_DATA, SKILL_ALIASES } from '../constants';

/**
 * STAGE 1: PREPROCESSING (Normalization)
 * Converts user input/aliases into canonical skill IDs
 */
export const normalizeSkills = (skills: string[]): string[] => {
  return skills.map(s => {
    const canonical = SKILL_ALIASES[s];
    return canonical || s;
  });
};

/**
 * STAGE 2: FEATURE ENGINEERING (Vectorization)
 * Skills are already IDs, but we ensure unique sets for calculation
 */
const getSkillVector = (skills: string[]): Set<string> => new Set(skills);

/**
 * STAGE 3: MATCHING & SCORING
 */

// Skill Score: Binary Cosine Similarity
export const calculateSkillScore = (seekerSkills: string[], jobSkills: string[]): number => {
  if (jobSkills.length === 0) return 0;
  if (seekerSkills.length === 0) return 0;
  
  const sSet = getSkillVector(seekerSkills);
  const jSet = getSkillVector(jobSkills);
  
  let dotProduct = 0;
  sSet.forEach(skillId => {
    if (jSet.has(skillId)) dotProduct++;
  });
  
  const magnitude = Math.sqrt(sSet.size) * Math.sqrt(jSet.size);
  return dotProduct / magnitude;
};

// Location Score: Decision Tree logic for Nigeria
export const calculateLocationScore = (seeker: UserProfile, job: Job): number => {
  if (job.isRemote) return 1.0;
  
  const sLoc = seeker.location;
  const jLoc = job.location;
  
  // Same City (Perfect)
  if (sLoc.city.toLowerCase() === jLoc.city.toLowerCase() && sLoc.state === jLoc.state) return 1.0;
  
  // Same State
  if (sLoc.state === jLoc.state) {
    // Relocation preference boosts same-state cross-city matches
    return seeker.relocatePreference ? 0.7 : 0.4;
  }
  
  // Different State
  return seeker.relocatePreference ? 0.2 : 0.05;
};

// Trend Score: Industry-based adjustment
export const calculateTrendScore = (industry: string): number => {
  const trend = TREND_DATA.find(t => t.industry === industry);
  // Default to 0.4 (neutral/low) if industry is unrecognized
  return trend ? trend.trendScore : 0.4;
};

/**
 * STAGE 4: RANKING & PRUNING
 * Efficiently computes matches for a seeker across all jobs
 */
export const getRecommendations = (seeker: UserProfile, allJobs: Job[]): MatchResult[] => {
  // 1. Candidate Pruning (Scalability)
  // We only score jobs that match the industry or are remote
  // In a real prod app, this would be a DB query with indexes
  const prunedJobs = allJobs.filter(job => {
    const industryMatch = seeker.skills.length === 0 || job.industry === 'Technology'; // Simplified for demo
    const locationViable = job.isRemote || job.location.state === seeker.location.state || seeker.relocatePreference;
    return job.status === 'OPEN' && locationViable;
  });

  // 2. Full Pipeline Scoring
  return prunedJobs.map(job => {
    const scoreSkill = calculateSkillScore(seeker.skills, job.requiredSkills);
    const scoreLocation = calculateLocationScore(seeker, job);
    const scoreTrend = calculateTrendScore(job.industry);
    
    // Final Weighted Score
    const scoreFinal = (WEIGHTS.SKILL * scoreSkill) + 
                       (WEIGHTS.LOCATION * scoreLocation) + 
                       (WEIGHTS.TREND * scoreTrend);
    
    return {
      job,
      scoreSkill,
      scoreLocation,
      scoreTrend,
      scoreFinal: Math.round(scoreFinal * 100) / 100
    };
  }).sort((a, b) => b.scoreFinal - a.scoreFinal); // 3. Ranking
};

/**
 * Single Match Wrapper (Legacy compatibility)
 */
export const computeMatch = (seeker: UserProfile, job: Job): MatchResult => {
  const scoreSkill = calculateSkillScore(seeker.skills, job.requiredSkills);
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

/**
 * Candidate Match Wrapper (Used by employers to find talent)
 */
export const computeCandidateMatch = (job: Job, seeker: UserProfile): CandidateResult => {
  const scoreSkill = calculateSkillScore(seeker.skills, job.requiredSkills);
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
