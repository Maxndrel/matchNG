
import { getRecommendations, computeMatch } from './matchingEngine';
import { getJobs, getUsers } from './storage';
import { UserProfile, Job } from '../types';

/**
 * USSD BRIDGE API (Simulated)
 * In production, these would be REST endpoints accessed by a USSD Gateway.
 * USSD sessions require rapid responses (<2s) and plain-text output.
 */

// USSD and SMS handlers are updated to handle async storage retrieval
export const handleUSSDRequest = async (phoneNumber: string, input: string): Promise<string> => {
  const users = await getUsers();
  const user = users.find(u => u.id === phoneNumber); // Simulating ID as phone number

  if (!user) {
    return "Welcome to matchNG.\n1. Register\n2. Help";
  }

  const step = input.split('*').length;
  
  switch(input) {
    case '1': { // Browse Matches
      const jobs = await getJobs();
      const matches = getRecommendations(user, jobs).slice(0, 3);
      let resp = "Top Matches for you:\n";
      matches.forEach((m, i) => {
        resp += `${i+1}. ${m.job.title} at ${m.job.employerName} (${(m.scoreFinal*100).toFixed(0)}%)\n`;
      });
      resp += "\nReply with # to apply.";
      return resp;
    }
    
    case '2': // Profile Summary
      return `Profile: ${user.fullName}\nSkills: ${user.skills.length}\nLocation: ${user.location.state}\n1. Update Location\n2. Back`;
    
    default:
      return "Main Menu:\n1. Browse Jobs\n2. My Profile\n3. USSD Help";
  }
};

/**
 * SMS COMMAND API (Simulated)
 * Users can text "MATCH" to 34788 to receive their top 3 roles via SMS.
 */
export const handleSMSCommand = async (command: string, userId: string): Promise<string> => {
  const cmd = command.toUpperCase().trim();
  
  if (cmd === 'MATCH') {
    const users = await getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return "matchNG: Profile not found. Register at matchng.gov.ng";
    
    const jobs = await getJobs();
    const matches = getRecommendations(user, jobs).slice(0, 3);
    return `matchNG: Top Matches for ${user.fullName}:\n` + 
           matches.map(m => `- ${m.job.title} @ ${m.job.employerName}`).join('\n');
  }

  if (cmd.startsWith('APPLY ')) {
    const jobId = cmd.replace('APPLY ', '');
    // Logic to queue application...
    return `matchNG: Application for JOB ID ${jobId} has been queued. You will be notified of progress via SMS.`;
  }

  return "matchNG: Unknown command. Text MATCH for jobs or HELP for options.";
};
