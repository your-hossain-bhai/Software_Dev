
const ROLE_TEMPLATES = {
  'Frontend Developer': {
    topics: ['HTML & CSS', 'JavaScript', 'React', 'State Management', 'Build Tools', 'Testing'],
    projects: ['Portfolio site', 'Todo app', 'Weather app', 'E-commerce UI', 'Dashboard', 'Social app clone'],
  },
  'Backend Developer': {
    topics: ['Node.js / Python', 'REST APIs', 'Database design', 'Authentication', 'Cloud basics', 'APM'],
    projects: ['REST API', 'Auth service', 'Blog API', 'Real-time chat', 'E-commerce API', 'Microservice'],
  },
  'Full Stack Developer': {
    topics: ['Frontend basics', 'Backend basics', 'Database', 'API design', 'Deployment', 'DevOps basics'],
    projects: ['Full CRUD app', 'Auth + Dashboard', 'Blog platform', 'E-commerce', 'Real-time app', 'SaaS MVP'],
  },
  'Data Analyst': {
    topics: ['SQL', 'Excel/Sheets', 'Python basics', 'Pandas', 'Visualization', 'Statistics'],
    projects: ['Data cleaning', 'Dashboard', 'Report automation', 'A/B analysis', 'EDA project', 'BI report'],
  },
  'UI/UX Designer': {
    topics: ['Design principles', 'Figma', 'Wireframing', 'Prototyping', 'User research', 'Design systems'],
    projects: ['Landing page', 'Mobile app UI', 'Dashboard redesign', 'Design system', 'Portfolio', 'Case study'],
  },
  'Web Developer': {
    topics: ['HTML & CSS', 'JavaScript', 'Responsive design', 'APIs', 'Hosting', 'Performance'],
    projects: ['Personal site', 'Landing page', 'Blog', 'Small business site', 'Portfolio', 'Interactive app'],
  },
  'Mobile Developer': {
    topics: ['Dart & OOP basics', 'Flutter widgets', 'State management', 'Navigation & routing', 'Firebase integration', 'Testing & release'],
    projects: ['Calculator app', 'Notes app', 'E-commerce mobile UI', 'Realtime chat app', 'Habit tracker', 'Production-ready portfolio app'],
  },
  'Flutter Developer': {
    topics: ['Dart fundamentals', 'Flutter UI & layouts', 'State management (Provider/Bloc)', 'API integration & networking', 'Firebase auth + storage', 'Testing, optimization & Play Store prep'],
    projects: ['To-do app', 'Weather app', 'Social feed UI', 'Job tracker app', 'Learning app with Firebase', 'Portfolio app with CI/CD'],
  },
  'React Native Developer': {
    topics: ['JavaScript/TypeScript', 'React Native fundamentals', 'Navigation patterns', 'State management', 'Native modules & device APIs', 'Performance & release process'],
    projects: ['Task app', 'Fitness tracker', 'E-commerce mobile app', 'Chat app', 'Location-based finder', 'Portfolio app'],
  },
  default: {
    topics: ['Core skills', 'Tools', 'Practice', 'Projects', 'Portfolio', 'Applications'],
    projects: ['Starter project', 'Portfolio', 'Real project', 'Open source', 'Freelance', 'Apply'],
  },
};

function normalizeText(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferRoleKey(role, currentSkills = []) {
  const normalizedRole = normalizeText(role);
  const skillsText = normalizeText(currentSkills.join(' '));
  const combined = `${normalizedRole} ${skillsText}`.trim();

  if (/flutter/.test(combined)) return 'Flutter Developer';
  if (/react native|expo/.test(combined)) return 'React Native Developer';
  if (/mobile|android|ios/.test(combined)) return 'Mobile Developer';
  if (/frontend|front end/.test(combined)) return 'Frontend Developer';
  if (/backend|back end/.test(combined)) return 'Backend Developer';
  if (/full stack|fullstack/.test(combined)) return 'Full Stack Developer';
  if (/data analyst|analytics|bi\b/.test(combined)) return 'Data Analyst';
  if (/ui\s*ux|product designer|ux/.test(combined)) return 'UI/UX Designer';
  if (/web developer|web development|web/.test(combined)) return 'Web Developer';

  return null;
}

function getTemplate(role, currentSkills = []) {
  const inferredKey = inferRoleKey(role, currentSkills);
  if (inferredKey && ROLE_TEMPLATES[inferredKey]) {
    return ROLE_TEMPLATES[inferredKey];
  }

  const normalizedRole = normalizeText(role);
  const key = Object.keys(ROLE_TEMPLATES).find((k) => {
    const normalizedKey = normalizeText(k);
    return normalizedRole.includes(normalizedKey) || normalizedKey.includes(normalizedRole);
  });

  return ROLE_TEMPLATES[key] || ROLE_TEMPLATES.default;
}

function projectKickoffText(project) {
  const normalized = normalizeText(project);
  if (normalized.includes('project') || normalized.includes('app')) {
    return `Build ${project}`;
  }
  return `Build ${project} project`;
}

function generateRoadmapSteps(targetRole, duration, currentSkills = []) {
  const template = getTemplate(targetRole, currentSkills);
  const { topics, projects } = template;
  const steps = [];
  const weeksPerStep = duration === 3 ? 2 : 4;
  const totalSteps = duration === 3 ? 6 : 6;

  for (let i = 0; i < totalSteps; i++) {
    const week = (i + 1) * weeksPerStep;
    const topic = topics[i] || topics[topics.length - 1];
    const project = projects[i] || projects[projects.length - 1];
    steps.push({
      week,
      topic,
      tasks: [
        `Master ${topic} fundamentals`,
        `Complete 2 focused practice exercises`,
        projectKickoffText(project),
        `Document progress`,
      ],
      projectIdeas: [project, `${topic} mini milestone`],
      jobApplicationTip:
        i >= 3
          ? `Consider applying to ${duration === 3 ? 'internships' : 'junior roles'} while continuing to build.`
          : 'Focus on learning; apply after Week ' + (weeksPerStep * 4) + '.',
    });
  }

  return steps;
}

module.exports = {
  generateRoadmapSteps,
  getTemplate,
};
