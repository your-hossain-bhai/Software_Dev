const knownDomains = {
  google: 'google.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.com',
  facebook: 'facebook.com',
  apple: 'apple.com',
  netflix: 'netflix.com',
  uber: 'uber.com',
  airbnb: 'airbnb.com',
  linkedin: 'linkedin.com',
  github: 'github.com',
  upwork: 'upwork.com',
  fiverr: 'fiverr.com',
};

const companyColors = ['7c3aed', '3b82f6', '06b6d4', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];

const devicons = {
  react: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  nodejs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  javascript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  typescript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  mongodb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  html: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  css: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  aws: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
  figma: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
  git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  vue: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
  django: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
  mysql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  postgresql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  firebase: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
  linux: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
  php: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
  redux: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
  jest: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg',
  tailwind: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
};

const normalizedKeys = {
  restapi: 'rest',
  reactnative: 'react',
  reactjs: 'react',
  vuejs: 'vue',
  node: 'nodejs',
  sql: 'mysql',
  tailwindcss: 'tailwind',
};

export const getCompanyLogo = (companyName = '') => {
  const key = companyName.toLowerCase();
  const domainKey = Object.keys(knownDomains).find((known) => key.includes(known));

  if (domainKey) {
    return `https://logo.clearbit.com/${knownDomains[domainKey]}`;
  }

  const colorIndex = (companyName.charCodeAt(0) || 0) % companyColors.length;
  const color = companyColors[colorIndex];
  const initials = companyName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CO';

  return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=128&bold=true&rounded=true`;
};

export const getJobIcon = (title = '') => {
  const t = title.toLowerCase();

  if (t.includes('design') || t.includes('ui') || t.includes('ux') || t.includes('figma')) return 'palette';
  if (t.includes('data') || t.includes('analyst') || t.includes('science')) return 'chart';
  if (t.includes('backend') || t.includes('node') || t.includes('django') || t.includes('python')) return 'server';
  if (t.includes('frontend') || t.includes('react') || t.includes('vue') || t.includes('web')) return 'code';
  if (t.includes('mobile') || t.includes('android') || t.includes('ios') || t.includes('app')) return 'smartphone';
  if (t.includes('devops') || t.includes('cloud') || t.includes('aws') || t.includes('docker')) return 'cloud';
  if (t.includes('ai') || t.includes('ml') || t.includes('machine')) return 'bot';
  if (t.includes('qa') || t.includes('test')) return 'flask';
  if (t.includes('full stack') || t.includes('fullstack')) return 'layers';

  return 'briefcase';
};

export const getSkillIcon = (skill = '') => {
  const s = skill.toLowerCase().replace(/\./g, '').replace(/\s/g, '');
  const finalKey = normalizedKeys[s] || s;
  return devicons[finalKey] || null;
};

export const getPlatformInfo = (platform = '') => {
  const platforms = {
    YouTube: { logo: 'https://logo.clearbit.com/youtube.com', color: 'from-red-500 to-red-600', icon: 'play' },
    Coursera: { logo: 'https://logo.clearbit.com/coursera.org', color: 'from-blue-500 to-blue-600', icon: 'graduation' },
    Udemy: { logo: 'https://logo.clearbit.com/udemy.com', color: 'from-purple-500 to-purple-600', icon: 'book' },
    freeCodeCamp: { logo: 'https://logo.clearbit.com/freecodecamp.org', color: 'from-green-500 to-green-600', icon: 'monitor' },
    MongoDB: { logo: 'https://logo.clearbit.com/mongodb.com', color: 'from-green-600 to-emerald-600', icon: 'leaf' },
    AWS: { logo: 'https://logo.clearbit.com/amazonaws.com', color: 'from-orange-500 to-amber-500', icon: 'cloud' },
    Docker: { logo: 'https://logo.clearbit.com/docker.com', color: 'from-blue-400 to-cyan-500', icon: 'ship' },
    React: { logo: devicons.react, color: 'from-cyan-400 to-blue-500', icon: 'atom' },
    'Node.js': { logo: devicons.nodejs, color: 'from-green-500 to-lime-500', icon: 'circle' },
    TypeScript: { logo: devicons.typescript, color: 'from-blue-500 to-blue-700', icon: 'square' },
    Tailwind: { logo: 'https://logo.clearbit.com/tailwindcss.com', color: 'from-cyan-400 to-teal-500', icon: 'palette' },
    DataCamp: { logo: 'https://logo.clearbit.com/datacamp.com', color: 'from-green-400 to-teal-500', icon: 'chart' },
    'Khan Academy': { logo: 'https://logo.clearbit.com/khanacademy.org', color: 'from-green-500 to-emerald-600', icon: 'school' },
    W3Schools: { logo: 'https://logo.clearbit.com/w3schools.com', color: 'from-green-600 to-green-700', icon: 'globe' },
    Figma: { logo: devicons.figma, color: 'from-purple-500 to-pink-500', icon: 'palette' },
    Jest: { logo: devicons.jest, color: 'from-red-400 to-orange-500', icon: 'flask' },
    'javascript.info': { logo: devicons.javascript, color: 'from-yellow-400 to-amber-500', icon: 'zap' },
    'REST API Tutorial': { logo: null, color: 'from-indigo-500 to-purple-500', icon: 'link' },
  };

  return platforms[platform] || { logo: null, color: 'from-gray-500 to-gray-600', icon: 'book-open' };
};
