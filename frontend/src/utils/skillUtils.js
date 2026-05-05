/**
 * Skill Normalization Utility
 * Handles parsing, normalization, deduplication, and proper capitalization of skills
 */

// Known acronyms that should be all caps
const ACRONYMS = new Set([
  'HTML', 'CSS', 'JS', 'TS', 'SQL', 'API', 'REST', 'UI', 'UX', 'AWS', 'GCP', 'CI', 'CD',
  'JWT', 'JSON', 'XML', 'HTTP', 'HTTPS', 'SSH', 'FTP', 'SDK', 'IDE', 'CLI', 'GUI',
  'OOP', 'MVP', 'MVC', 'MVVM', 'DOM', 'SEO', 'SPA', 'SSR', 'PWA', 'CRUD', 'ORM',
  'NPM', 'NVM', 'PHP', 'ASP', 'JVM', 'GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'OS',
  'AI', 'ML', 'DL', 'NLP', 'CV', 'ETL', 'BI', 'KPI', 'CRM', 'ERP', 'SaaS', 'PaaS',
]);

// Special case mappings for proper display
const SPECIAL_CASES = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node': 'Node.js',
  'reactjs': 'React',
  'react.js': 'React',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'vue': 'Vue.js',
  'angularjs': 'Angular',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'nuxtjs': 'Nuxt.js',
  'nuxt.js': 'Nuxt.js',
  'expressjs': 'Express.js',
  'express.js': 'Express.js',
  'express': 'Express.js',
  'mongodb': 'MongoDB',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mysql': 'MySQL',
  'graphql': 'GraphQL',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'opencv': 'OpenCV',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'bitbucket': 'Bitbucket',
  'vscode': 'VS Code',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'gcp': 'Google Cloud',
  'azure': 'Azure',
  'firebase': 'Firebase',
  'heroku': 'Heroku',
  'netlify': 'Netlify',
  'vercel': 'Vercel',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'sass': 'Sass',
  'scss': 'Sass',
  'less': 'LESS',
  'webpack': 'Webpack',
  'vite': 'Vite',
  'babel': 'Babel',
  'eslint': 'ESLint',
  'prettier': 'Prettier',
  'jest': 'Jest',
  'mocha': 'Mocha',
  'cypress': 'Cypress',
  'selenium': 'Selenium',
  'redux': 'Redux',
  'mobx': 'MobX',
  'zustand': 'Zustand',
  'jquery': 'jQuery',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',
  'spring': 'Spring Boot',
  'springboot': 'Spring Boot',
  'laravel': 'Laravel',
  'rails': 'Ruby on Rails',
  'ror': 'Ruby on Rails',
  'rubyonrails': 'Ruby on Rails',
  'dotnet': '.NET',
  '.net': '.NET',
  'csharp': 'C#',
  'c#': 'C#',
  'cpp': 'C++',
  'c++': 'C++',
  'golang': 'Go',
  'rustlang': 'Rust',
  'kotlin': 'Kotlin',
  'swift': 'Swift',
  'flutter': 'Flutter',
  'reactnative': 'React Native',
  'react native': 'React Native',
  'ios': 'iOS',
  'android': 'Android',
  'figma': 'Figma',
  'sketch': 'Sketch',
  'adobexd': 'Adobe XD',
  'photoshop': 'Photoshop',
  'illustrator': 'Illustrator',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scipy': 'SciPy',
  'matplotlib': 'Matplotlib',
  'scikit-learn': 'Scikit-learn',
  'sklearn': 'Scikit-learn',
  'powerbi': 'Power BI',
  'power bi': 'Power BI',
  'tableau': 'Tableau',
  'excel': 'Excel',
  'machinelearning': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'deeplearning': 'Deep Learning',
  'deep learning': 'Deep Learning',
  'datascience': 'Data Science',
  'data science': 'Data Science',
  'dataanalysis': 'Data Analysis',
  'data analysis': 'Data Analysis',
  'dataengineering': 'Data Engineering',
  'data engineering': 'Data Engineering',
  'devops': 'DevOps',
  'devsecops': 'DevSecOps',
  'sre': 'SRE',
  'fullstack': 'Full Stack',
  'full stack': 'Full Stack',
  'frontend': 'Frontend',
  'backend': 'Backend',
  'webdev': 'Web Development',
  'webdevelopment': 'Web Development',
  'web development': 'Web Development',
  'mobiledev': 'Mobile Development',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'kanban': 'Kanban',
  'jira': 'Jira',
  'trello': 'Trello',
  'linux': 'Linux',
  'unix': 'Unix',
  'windows': 'Windows',
  'macos': 'macOS',
  'bash': 'Bash',
  'powershell': 'PowerShell',
  'vim': 'Vim',
  'emacs': 'Emacs',
  'redis': 'Redis',
  'elasticsearch': 'Elasticsearch',
  'kafka': 'Kafka',
  'rabbitmq': 'RabbitMQ',
  'nginx': 'NGINX',
  'apache': 'Apache',
  'cicd': 'CI/CD',
  'ci/cd': 'CI/CD',
  'jenkins': 'Jenkins',
  'travis': 'Travis CI',
  'circleci': 'CircleCI',
  'githubactions': 'GitHub Actions',
  'github actions': 'GitHub Actions',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'puppet': 'Puppet',
  'chef': 'Chef',
};

// Stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that',
  'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which',
  'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
  'etc', 'build', 'thon', 'building', 'using', 'used', 'use', 'including', 'include',
]);

/**
 * Capitalize a skill name properly
 */
export function capitalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return '';
  
  const trimmed = skill.trim();
  if (!trimmed) return '';
  
  const lower = trimmed.toLowerCase();
  
  // Check special cases first
  if (SPECIAL_CASES[lower]) {
    return SPECIAL_CASES[lower];
  }
  
  // Check if it's an acronym
  const upper = trimmed.toUpperCase();
  if (ACRONYMS.has(upper)) {
    return upper;
  }
  
  // Title case for multi-word skills
  return lower
    .split(' ')
    .map(word => {
      const wordUpper = word.toUpperCase();
      if (ACRONYMS.has(wordUpper)) return wordUpper;
      if (SPECIAL_CASES[word]) return SPECIAL_CASES[word];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Check if a string is a valid skill (not a stop word or too short)
 */
export function isValidSkill(skill) {
  if (!skill || typeof skill !== 'string') return false;
  const trimmed = skill.trim().toLowerCase();
  if (trimmed.length < 2) return false;
  if (STOP_WORDS.has(trimmed)) return false;
  // Filter out numbers-only strings
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}

/**
 * Parse comma-separated skill input into normalized skill array
 */
export function parseSkillInput(input) {
  if (!input || typeof input !== 'string') return [];
  
  // Split by comma, trim each, filter empties
  const parts = input
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  const skills = [];
  const seen = new Set();
  
  for (const part of parts) {
    if (!isValidSkill(part)) continue;
    
    const normalized = capitalizeSkill(part);
    const key = normalized.toLowerCase();
    
    if (!seen.has(key)) {
      seen.add(key);
      skills.push({
        name: normalized,
        source: 'manual',
        strength: 'medium',
      });
    }
  }
  
  return skills;
}

/**
 * Normalize extracted skills (from CV) - handles broken words, stop words, duplicates
 */
export function normalizeExtractedSkills(skills) {
  if (!Array.isArray(skills)) return [];
  
  const normalized = [];
  const seen = new Set();
  
  for (const skill of skills) {
    const name = typeof skill === 'string' ? skill : skill?.name;
    if (!name || !isValidSkill(name)) continue;
    
    const capitalized = capitalizeSkill(name);
    const key = capitalized.toLowerCase();
    
    if (!seen.has(key)) {
      seen.add(key);
      normalized.push({
        name: capitalized,
        source: skill?.source || 'cv',
        strength: skill?.strength || 'medium',
      });
    }
  }
  
  return normalized;
}

/**
 * Merge skills without duplicates
 */
export function mergeSkills(existing, newSkills) {
  const merged = [...existing];
  const seen = new Set(existing.map(s => s.name.toLowerCase()));
  
  for (const skill of newSkills) {
    const key = skill.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(skill);
    }
  }
  
  return merged;
}

export default {
  capitalizeSkill,
  isValidSkill,
  parseSkillInput,
  normalizeExtractedSkills,
  mergeSkills,
};
