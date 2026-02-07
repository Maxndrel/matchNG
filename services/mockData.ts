
import { UserProfile, Job, UserRole } from '../types';

export const MOCK_SEEKER: UserProfile = {
  id: 'u1',
  fullName: 'Chidi Okeke',
  role: UserRole.SEEKER,
  skills: ['1', '3', '10'], // React, Generator Repair, Customer Service
  location: {
    state: 'Lagos',
    lga: 'Ikeja',
    city: 'Ikeja',
    lat: 6.5965,
    lon: 3.3421
  },
  remotePreference: true,
  relocatePreference: false,
  savedJobIds: [],
  appliedJobIds: [],
  education: [
    { institution: 'University of Lagos', degree: 'B.Sc Computer Science', year: '2022' }
  ],
  experience: [
    { company: 'TechStart Nigeria', role: 'Junior Developer', duration: '1 year' }
  ]
};

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    employerId: 'e1',
    employerName: 'Paystack',
    title: 'Frontend Engineer',
    industry: 'Technology',
    description: 'Looking for React experts in Lagos.',
    requiredSkills: ['1', '2', '9'],
    location: { state: 'Lagos', lga: 'Ikeja', city: 'Ikeja', lat: 6.5965, lon: 3.3421 },
    isRemote: true,
    status: 'OPEN',
    // Fix: Added missing createdAt property
    createdAt: new Date().toISOString()
  },
  {
    id: 'j2',
    employerId: 'e2',
    employerName: 'AgroAllied Ltd',
    title: 'Technician',
    industry: 'Agriculture',
    description: 'Maintenance of farm generators and equipment.',
    requiredSkills: ['3', '8'],
    location: { state: 'Kaduna', lga: 'Chikun', city: 'Kaduna', lat: 10.5105, lon: 7.4165 },
    isRemote: false,
    status: 'OPEN',
    // Fix: Added missing createdAt property
    createdAt: new Date().toISOString()
  },
  {
    id: 'j3',
    employerId: 'e3',
    employerName: 'Ibadan Solar',
    title: 'Support Desk',
    industry: 'Renewable Energy',
    description: 'Helping customers with solar setup.',
    requiredSkills: ['10', '8'],
    location: { state: 'Oyo', lga: 'Ibadan', city: 'Ibadan', lat: 7.3775, lon: 3.9470 },
    isRemote: false,
    status: 'OPEN',
    // Fix: Added missing createdAt property
    createdAt: new Date().toISOString()
  }
];

export const MOCK_EMPLOYER: UserProfile = {
  id: 'e1',
  fullName: 'Boluwatife Adeleke',
  role: UserRole.EMPLOYER,
  skills: [],
  location: { state: 'Lagos', lga: 'Lekki', city: 'Lagos', lat: 6.4589, lon: 3.6015 },
  remotePreference: false,
  relocatePreference: false,
  savedJobIds: [],
  appliedJobIds: [],
  education: [],
  experience: []
};
