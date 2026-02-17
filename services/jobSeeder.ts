
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
  "Dangote Group", "IITA Ibadan", "Sterling Bank", "Lagos Health Service", 
  "Julius Berger", "MTN Nigeria", "Olam Agriculture", "TotalEnergies", 
  "BUA Group", "MainOne", "GIG Logistics", "Kobo360", "Interswitch",
  "Nigeria LNG", "Access Bank", "Honeywell Flour Mills", "Arise News",
  "Zinox Technologies", "Andela", "Flutterwave", "Paystack"
];

const ROLE_PREFIXES = ["Senior", "Lead", "Junior", "Specialist", "Officer", "Supervisor", "Field", "Project"];

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

    // Industry-aware remote logic
    // Tech: 20% Remote | Others: 5% Remote
    let isRemote = false;
    if (industry === 'Technology') {
      isRemote = i % 5 === 0;
    } else {
      isRemote = i % 20 === 0;
    }

    const costOfLivingMultiplier = (stateData.name === 'Lagos' || stateData.name === 'Abuja (FCT)') ? 1.4 : 1.0;
    const baseSalary = industry === 'Technology' ? 180000 : 85000;
    const expMultiplier = (i % 3 === 0) ? 2.2 : (i % 3 === 1) ? 1.4 : 1.0;
    
    const lowRange = Math.floor(baseSalary * expMultiplier * costOfLivingMultiplier);
    const highRange = Math.floor(lowRange * 1.5);

    // Contextual description based on industry and onsite/remote status
    let description = '';
    const onsiteNote = isRemote ? "This is a fully remote position." : `This is a strictly onsite role located at our facility in ${city}, ${stateData.name}.`;

    if (industry === 'Technology') {
      description = `We are seeking a ${title} to join our high-growth engineering team. ${onsiteNote} You will work on building scalable solutions for our pan-African user base. Expertise in ${skill} is essential for success in this role.`;
    } else if (industry === 'Construction') {
      description = `Join our major infrastructure project in ${stateData.name}. ${onsiteNote} We need a skilled ${skill} expert to ensure structural integrity and safety standards are met on the field. Physical presence at the ${city} site is mandatory.`;
    } else if (industry === 'Agriculture') {
      description = `As a ${title}, you will be at the heart of our food security mission. ${onsiteNote} Your work in ${skill} will help optimize yield and distribution across the region. Field work in ${city} is a core part of this responsibility.`;
    } else if (industry === 'Healthcare') {
      description = `Our medical facility in ${city} requires an experienced ${title}. ${onsiteNote} We are committed to providing top-tier patient care through excellence in ${skill}. Requires valid professional certification.`;
    } else if (industry === 'Transportation') {
      description = `Managing logistics across the ${zoneData.zone} requires precision and dedication. ${onsiteNote} As a ${title}, you will handle critical ${skill} operations to keep Nigeria moving. Shift work may be required.`;
    }

    const job: Job = {
      id: `job-${i.toString().padStart(5, '0')}`,
      employerId: `emp-${i % EMPLOYERS.length}`,
      employerName: EMPLOYERS[i % EMPLOYERS.length],
      title: title,
      industry: industry,
      description: description,
      requiredSkills: [skill],
      location: {
        state: stateData.name,
        city: city,
        lga: city,
        lat: 0,
        lon: 0
      },
      isRemote: isRemote,
      status: 'OPEN',
      createdAt: new Date(Date.now() - (i * 1000 * 60 * 5)).toISOString(),
      salaryRange: `₦${lowRange.toLocaleString()} - ₦${highRange.toLocaleString()}`
    };

    jobs.push(job);
  }

  return jobs;
}
