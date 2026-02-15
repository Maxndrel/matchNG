
import { Job, UserProfile } from '../types';
import { INDUSTRIES, SKILL_INDEX } from '../constants';

export interface MarketInsights {
  topIndustries: { name: string; count: number; growth: string }[];
  salaryBenchmarks: Record<string, { entry: number; mid: number; senior: number }>;
  regionalDemand: { state: string; demandScore: number }[];
}

/**
 * ANALYTICS ENGINE v1.0
 * Processes raw job data to extract actionable market intelligence.
 */

export const getMarketInsights = (allJobs: Job[]): MarketInsights => {
  const industryCounts: Record<string, number> = {};
  const stateCounts: Record<string, number> = {};
  const salaries: Record<string, number[]> = {};

  allJobs.forEach(job => {
    // Count industries
    industryCounts[job.industry] = (industryCounts[job.industry] || 0) + 1;
    
    // Count states
    stateCounts[job.location.state] = (stateCounts[job.location.state] || 0) + 1;

    // Parse salaries (Nigerian Naira format)
    if (job.salaryRange) {
      const numeric = job.salaryRange.replace(/[^\d-]/g, '').split('-');
      if (numeric.length === 2) {
        const avg = (parseInt(numeric[0]) + parseInt(numeric[1])) / 2;
        if (!salaries[job.industry]) salaries[job.industry] = [];
        salaries[job.industry].push(avg);
      }
    }
  });

  const topIndustries = Object.entries(industryCounts)
    .map(([name, count]) => ({
      name,
      count,
      growth: count > 50 ? '+12.4%' : '+5.2%' // Simulated growth based on density
    }))
    .sort((a, b) => b.count - a.count);

  const salaryBenchmarks: Record<string, { entry: number; mid: number; senior: number }> = {};
  INDUSTRIES.forEach(ind => {
    const vals = salaries[ind] || [120000];
    const base = Math.min(...vals);
    salaryBenchmarks[ind] = {
      entry: base,
      mid: base * 1.8,
      senior: base * 3.5
    };
  });

  const regionalDemand = Object.entries(stateCounts).map(([state, count]) => ({
    state,
    demandScore: Math.min(100, Math.floor((count / (allJobs.length / 10)) * 100))
  }));

  return { topIndustries, salaryBenchmarks, regionalDemand };
};

export const getSkillGapAnalysis = (user: UserProfile, jobs: Job[]) => {
  const relevantJobs = jobs.filter(j => j.industry === user.primaryIndustry);
  const requiredSkillsCount: Record<string, number> = {};

  relevantJobs.forEach(j => {
    j.requiredSkills.forEach(s => {
      requiredSkillsCount[s] = (requiredSkillsCount[s] || 0) + 1;
    });
  });

  const missingSkills = Object.entries(requiredSkillsCount)
    .filter(([skill]) => !user.skills.includes(skill))
    .map(([name, demand]) => ({
      name,
      demandRate: Math.round((demand / Math.max(1, relevantJobs.length)) * 100),
      resources: getLearningResources(name)
    }))
    .sort((a, b) => b.demandRate - a.demandRate);

  return missingSkills;
};

const getLearningResources = (skillName: string) => {
  const resources = [
    { title: `${skillName} Fundamentals`, provider: 'matchNG Academy', type: 'Course' },
    { title: `Mastering ${skillName} in Nigeria`, provider: 'Utiva', type: 'Workshop' },
    { title: `${skillName} Certification Path`, provider: 'ALX Africa', type: 'Certification' }
  ];
  return resources;
};
