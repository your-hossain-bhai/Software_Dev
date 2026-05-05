const RESPONSES = {
  role_fit: {
    keywords: ['fit', 'suit', 'role', 'career', 'path', 'right for me'],
    answer: `Based on your profile, I can suggest roles that might align with your skills. However, career fit depends on many factors including your interests, values, and market conditions. These suggestions are indicative, not guaranteed. Consider speaking with a career counselor for personalized advice.`,
  },
  learn_next: {
    keywords: ['learn next', 'what to learn', 'next skill', 'improve', 'upskill'],
    answer: `I recommend focusing on skills that appear in job postings for your target role. Check the "Missing skills" in your job matches to prioritize. Start with one skill, build a small project, then move to the next. Learning is continuous—pick based on demand and your interest. This is a suggestion, not a prescription.`,
  },
  internship: {
    keywords: ['internship', 'intern', 'prepare', 'get started', 'first job'],
    answer: `For internships: 1) Build 2-3 portfolio projects relevant to the role. 2) Practice behavioral questions (STAR method). 3) Apply early and widely. 4) Tailor your resume for each application. Outcomes vary—these are general tips, not guarantees of placement.`,
  },
  salary: {
    keywords: ['salary', 'pay', 'compensation', 'earn'],
    answer: `Salary varies by company, location, and role. I don't provide specific salary data. Use platforms like Glassdoor, Levels.fyi, or local job boards for estimates. Always research before negotiations.`,
  },
  default: {
    answer: `I'm a career assistant. I can help with: role fit, what to learn next, internship preparation, and general career guidance. My answers are suggestive and based on common practices—not professional advice. Ask me something like "What should I learn next?" or "How do I prepare for internships?"`,
  },
};

function getBotResponse(query) {
  const q = (query || '').toLowerCase();
  for (const [key, config] of Object.entries(RESPONSES)) {
    if (key === 'default') continue;
    if (config.keywords.some((k) => q.includes(k))) {
      return {
        answer: config.answer,
        disclaimer: 'Suggestions are indicative. Not professional career advice. Results may vary.',
      };
    }
  }
  return {
    answer: RESPONSES.default.answer,
    disclaimer: 'Suggestions are indicative. Not professional career advice.',
  };
}

module.exports = { getBotResponse };
