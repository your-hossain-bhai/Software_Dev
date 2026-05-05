/**
 * Enhanced Skill Extraction Utility
 * Handles keyword-based extraction with proper normalization, deduplication,
 * and filtering of stop words and broken tokens
 */

// Comprehensive skill keywords (lowercase for matching)
const SKILL_KEYWORDS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'golang',
  'rust', 'kotlin', 'swift', 'scala', 'perl', 'r', 'dart', 'lua', 'haskell', 'elixir',
  // Frontend
  'html', 'css', 'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby',
  'tailwind', 'bootstrap', 'sass', 'less', 'webpack', 'vite', 'babel', 'redux', 'mobx',
  // Backend
  'node', 'express', 'django', 'flask', 'fastapi', 'spring', 'laravel', '.net', 'rails',
  'nestjs', 'graphql', 'rest', 'api',
  // Databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'firebase',
  'dynamodb', 'cassandra', 'sqlite', 'oracle', 'mariadb',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'ansible',
  'jenkins', 'github actions', 'gitlab', 'ci/cd', 'linux', 'nginx',
  // Data & AI/ML
  'machine learning', 'deep learning', 'data science', 'data analysis', 'pandas', 'numpy',
  'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'opencv', 'nlp', 'computer vision',
  'power bi', 'tableau', 'excel', 'spark', 'hadoop',
  // Tools
  'git', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'jira', 'trello',
  'postman', 'vs code', 'vim',
  // Testing
  'jest', 'mocha', 'cypress', 'selenium', 'pytest', 'junit', 'testing',
  // Concepts
  'agile', 'scrum', 'kanban', 'devops', 'microservices', 'serverless',
  // Mobile
  'flutter', 'react native', 'ios', 'android', 'swift', 'kotlin',
  // Design
  'ui', 'ux', 'ui/ux', 'design', 'responsive design', 'accessibility',
  // Other
  'blockchain', 'web3', 'solidity', 'ethereum', 'security', 'networking',
];

// Multi-word skill patterns (to merge broken tokens)
const MULTI_WORD_SKILLS = [
  'machine learning', 'deep learning', 'data science', 'data analysis', 'data engineering',
  'full stack', 'front end', 'back end', 'react native', 'ruby on rails', 'google cloud',
  'power bi', 'vs code', 'adobe xd', 'github actions', 'computer vision',
  'natural language processing', 'web development', 'mobile development',
  'software engineering', 'spring boot', 'node.js', 'next.js', 'vue.js', 'express.js',
  'ci/cd', 'ui/ux', 'rest api', 'graphql api',
];

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
  'worked', 'work', 'working', 'project', 'projects', 'developed', 'development',
  'experience', 'experienced', 'knowledge', 'understanding', 'familiar', 'proficient',
  'strong', 'good', 'basic', 'advanced', 'intermediate', 'years', 'year', 'months',
  'month', 'skills', 'skill', 'hackathon', 'hackathons', 'competition', 'competitions',
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
  'nuxt': 'Nuxt.js',
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
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'gcp': 'Google Cloud',
  'google cloud': 'Google Cloud',
  'azure': 'Azure',
  'firebase': 'Firebase',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'sass': 'Sass',
  'scss': 'Sass',
  'webpack': 'Webpack',
  'vite': 'Vite',
  'jest': 'Jest',
  'cypress': 'Cypress',
  'redux': 'Redux',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',
  'spring': 'Spring Boot',
  'spring boot': 'Spring Boot',
  'laravel': 'Laravel',
  'rails': 'Ruby on Rails',
  'ruby on rails': 'Ruby on Rails',
  'dotnet': '.NET',
  '.net': '.NET',
  'csharp': 'C#',
  'c#': 'C#',
  'cpp': 'C++',
  'c++': 'C++',
  'golang': 'Go',
  'go': 'Go',
  'rust': 'Rust',
  'kotlin': 'Kotlin',
  'swift': 'Swift',
  'flutter': 'Flutter',
  'react native': 'React Native',
  'reactnative': 'React Native',
  'ios': 'iOS',
  'android': 'Android',
  'figma': 'Figma',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scikit-learn': 'Scikit-learn',
  'sklearn': 'Scikit-learn',
  'power bi': 'Power BI',
  'powerbi': 'Power BI',
  'tableau': 'Tableau',
  'excel': 'Excel',
  'machine learning': 'Machine Learning',
  'machinelearning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'deeplearning': 'Deep Learning',
  'dl': 'Deep Learning',
  'data science': 'Data Science',
  'datascience': 'Data Science',
  'data analysis': 'Data Analysis',
  'dataanalysis': 'Data Analysis',
  'devops': 'DevOps',
  'full stack': 'Full Stack',
  'fullstack': 'Full Stack',
  'front end': 'Frontend',
  'frontend': 'Frontend',
  'back end': 'Backend',
  'backend': 'Backend',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'jira': 'Jira',
  'linux': 'Linux',
  'bash': 'Bash',
  'redis': 'Redis',
  'elasticsearch': 'Elasticsearch',
  'kafka': 'Kafka',
  'nginx': 'NGINX',
  'cicd': 'CI/CD',
  'ci/cd': 'CI/CD',
  'jenkins': 'Jenkins',
  'github actions': 'GitHub Actions',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'nlp': 'NLP',
  'natural language processing': 'NLP',
  'computer vision': 'Computer Vision',
  'cv': 'Computer Vision',
  'ui': 'UI',
  'ux': 'UX',
  'ui/ux': 'UI/UX',
  'sql': 'SQL',
  'nosql': 'NoSQL',
  'rest': 'REST API',
  'rest api': 'REST API',
  'graphql api': 'GraphQL',
  'api': 'API',
  'html': 'HTML',
  'css': 'CSS',
  'git': 'Git',
  'postman': 'Postman',
  'testing': 'Testing',
  'mocha': 'Mocha',
  'selenium': 'Selenium',
};

// Known acronyms for capitalization
const ACRONYMS = new Set([
  'HTML', 'CSS', 'JS', 'TS', 'SQL', 'API', 'REST', 'UI', 'UX', 'AWS', 'GCP', 'CI', 'CD',
  'JWT', 'JSON', 'XML', 'HTTP', 'HTTPS', 'SSH', 'SDK', 'IDE', 'CLI', 'GUI', 'OOP', 'MVP',
  'MVC', 'MVVM', 'DOM', 'SEO', 'SPA', 'SSR', 'PWA', 'CRUD', 'ORM', 'NPM', 'PHP', 'JVM',
  'AI', 'ML', 'DL', 'NLP', 'CV', 'ETL', 'BI', 'KPI', 'SaaS', 'PaaS',
]);

/**
 * Capitalize skill properly
 */
function capitalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return '';
  
  const trimmed = skill.trim();
  if (!trimmed) return '';
  
  const lower = trimmed.toLowerCase();
  
  // Check special cases first
  if (SPECIAL_CASES[lower]) {
    return SPECIAL_CASES[lower];
  }
  
  // Check acronyms
  const upper = trimmed.toUpperCase();
  if (ACRONYMS.has(upper)) {
    return upper;
  }
  
  // Title case
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
 * Check if a word is a valid skill candidate
 */
function isValidSkillCandidate(word) {
  if (!word || typeof word !== 'string') return false;
  const lower = word.toLowerCase().trim();
  if (lower.length < 2) return false;
  if (STOP_WORDS.has(lower)) return false;
  if (/^\d+$/.test(lower)) return false;
  return true;
}

/**
 * Extract skills from text with comprehensive normalization
 */
function extractSkillsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  
  // Normalize text
  const normalizedText = text
    .toLowerCase()
    .replace(/[^\w\s\+\#\.\/\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const found = new Set();
  
  // First pass: Look for multi-word skills
  for (const multiWord of MULTI_WORD_SKILLS) {
    if (normalizedText.includes(multiWord)) {
      const capitalized = capitalizeSkill(multiWord);
      found.add(capitalized);
    }
  }
  
  // Second pass: Look for single keywords
  for (const keyword of SKILL_KEYWORDS) {
    // Skip multi-word skills already handled
    if (keyword.includes(' ')) continue;
    
    // Create word boundary regex
    const regex = new RegExp(`\\b${keyword.replace(/[+#.]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedText)) {
      const capitalized = capitalizeSkill(keyword);
      // Don't add if it's part of a multi-word skill already found
      const isPartOfMultiWord = Array.from(found).some(
        s => s.toLowerCase().includes(keyword) && s.toLowerCase() !== keyword
      );
      if (!isPartOfMultiWord) {
        found.add(capitalized);
      }
    }
  }
  
  // Convert to skill objects
  return Array.from(found)
    .filter(name => isValidSkillCandidate(name))
    .map(name => ({
      name,
      source: 'cv',
      strength: 'medium',
    }));
}

module.exports = {
  extractSkillsFromText,
  capitalizeSkill,
  SKILL_KEYWORDS,
  STOP_WORDS,
  SPECIAL_CASES,
};
