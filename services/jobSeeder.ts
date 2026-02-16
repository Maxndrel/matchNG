
"use client";

import { Job } from '../types';
import { INDUSTRIES, ONBOARDING_MAP } from '../constants';

/**
 * NIGERIAN LABOUR MARKET GEOPOLITICAL REGISTRY
 */
const GEO_REGISTRY = [
  {
    zone: 'South West',
    states: [
      { name: 'Lagos', cities: ['Ikeja', 'Lekki', 'Epe', 'Badagry', 'Ikorodu'], hub: 'Tech/Logistics' },
      { name: 'Oyo', cities: ['Ibadan North', 'Ogbomosho', 'Iseyin'], hub: 'Agri/Education' },
      { name: 'Ogun', cities: ['Abeokuta', 'Ota', 'Sagamu'], hub: 'Manufacturing' }
    ]
  },
  {
    zone: 'North Central',
    states: [
      { name: 'Abuja (FCT)', cities: ['Garki', 'Maitama', 'Gwagwalada', 'Kuje'], hub: 'Admin/Tech' },
      { name: 'Benue', cities: ['Makurdi', 'Gboko', 'Otukpo'], hub: 'Agri/Food' },
      { name: 'Plateau', cities: ['Jos North', 'Barkin Ladi'], hub: 'Mining/Agri' }
    ]
  },
  {
    zone: 'South South',
    states: [
      { name: 'Rivers', cities: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Bonny'], hub: 'Energy/Maritime' },
      { name: 'Edo', cities: ['Benin City', 'Uromi', 'Auchi'], hub: 'Logistics/Trade' },
      { name: 'Delta', cities: ['Warri', 'Asaba', 'Ughelli'], hub: 'Energy' }
    ]
  },
  {
    zone: 'North West',
    states: [
      { name: 'Kano', cities: ['Fagge', 'Dala', 'Wudil'], hub: 'Commerce/Agri' },
      { name: 'Kaduna', cities: ['Kaduna North', 'Zaria', 'Kafanchan'], hub: 'Logistics/Industrial' },
      { name: 'Sokoto', cities: ['Sokoto South', 'Wamako'], hub: 'Trade/Agri' }
    ]
  },
  {
    zone: 'South East',
    states: [
      { name: 'Anambra', cities: ['Onitsha', 'Nnewi', 'Awka'], hub: 'Manufacturing/Trade' },
      { name: 'Enugu', cities: ['Enugu North', 'Nsukka', 'Agbani'], hub: 'Tech/Education' },
      { name: 'Abia', cities: ['Aba North', 'Umuahia'], hub: 'SME/Trade' }
    ]
  },
  {
    zone: 'North East',
    states: [
      { name: 'Borno', cities: ['Maiduguri', 'Biu', 'Jere'], hub: 'NGO/Health' },
      { name: 'Bauchi', cities: ['Bauchi Central', 'Azare', 'Misau'], hub: 'Agri' },
      { name: 'Adamawa', cities: ['Yola North', 'Mubi'], hub: 'Agri/Trade' }
    ]
  }
];

const EMPLOYERS = [
  "Dangote Refinery", "IITA Ibadan", "Sterling Bank", "Lagos Health Service", 
  "Julius Berger", "MTN Nigeria", "Olam Agriculture", "TotalEnergies", 
  "BUA Group", "MainOne", "GIG Logistics", "Kobo360", "Interswitch"
];

const ROLE_PREFIXES = ["Senior", "Lead", "Junior", "Specialist", "Officer", "Supervisor"];

/**
 * Generates a robust set of jobs for MVP seeding.
 * Strictly uses the provided Industry/Skill hierarchy.
 */
export function generateSeedJobs(): Job[] {
  const jobs: Job[] = [];
  const TOTAL_COUNT = 800; 
  
  for (let i = 0; i < TOTAL_COUNT; i++) {
    const zoneData = GEO_REGISTRY[i % GEO_REGISTRY.length];
    const stateData = zoneData.states[i % zoneData.states.length];
    const city = stateData.cities[i % stateData.cities.length];
    
    // Cycle through industries
    const industry = INDUSTRIES[i % INDUSTRIES.length];
    
    // Cycle through skills for that specific industry
    const skillsList = ONBOARDING_MAP[industry].skills;
    const skill = skillsList[i % skillsList.length];

    // Generate a title based on the skill
    const prefix = ROLE_PREFIXES[i % ROLE_PREFIXES.length];
    const title = `${prefix} ${skill}`;

    const costOfLivingMultiplier = (stateData.name === 'Lagos' || stateData.name === 'Abuja (FCT)') ? 1.5 : 1.0;
    const baseSalary = industry === 'Technology' ? 220000 : 95000;
    const expMultiplier = (i % 3 === 0) ? 2.5 : (i % 3 === 1) ? 1.5 : 1.0;
    const lowRange = Math.floor(baseSalary * expMultiplier * costOfLivingMultiplier);
    const highRange = Math.floor(lowRange * 1.4);

    const job: Job = {
      id: `job-${i.toString().padStart(5, '0')}`,
      employerId: `emp-${i % EMPLOYERS.length}`,
      employerName: EMPLOYERS[i % EMPLOYERS.length],
      title: title,
      industry: industry,
      description: `We are looking for a qualified ${title} to join our team in ${stateData.name}. As a ${skill} professional, you will be responsible for operational excellence in the ${city} district. Deep expertise in ${skill} is mandatory for this role.`,
      requiredSkills: [skill],
      location: {
        state: stateData.name,
        city: city,
        lga: city,
        lat: 0,
        lon: 0
      },
      isRemote: i % 15 === 0, 
      status: 'OPEN',
      createdAt: new Date(Date.now() - (i * 1000 * 60 * 5)).toISOString(),
      salaryRange: `₦${lowRange.toLocaleString()} - ₦${highRange.toLocaleString()}`
    };

    jobs.push(job);
  }

  return jobs;
}
