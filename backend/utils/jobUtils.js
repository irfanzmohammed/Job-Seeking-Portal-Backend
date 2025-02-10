import axios from 'axios';

// Fetch all jobs from the backend API
export const fetchAllJobs = async () => {
  try {
    const response = await axios.get('http://localhost:4000/api/v1/jobs');
    return response.data.jobs;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return [];
  }
};

// Perform partial matching of skills for job filtering
export const filterJobsBySkills = (jobs, userSkills) => {
  if (!userSkills || userSkills.length === 0) {
    return jobs; // If user has no skills, return all jobs
  }

  return jobs.filter(job => {
    const jobSkills = job.requiredSkills.map(skill => skill.toLowerCase());

    // Convert user skills to lowercase for case-insensitive matching
    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());

    // Check if any job skill matches any user skill
    return jobSkills.some(jobSkill => {
      return normalizedUserSkills.some(userSkill => jobSkill.includes(userSkill));
    });
  });
};
