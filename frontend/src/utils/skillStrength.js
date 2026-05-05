const strongKeywords = [
  'react',
  'node',
  'python',
  'machine learning',
  'deep learning',
  'tensorflow',
  'pytorch',
];

const mediumKeywords = [
  'html',
  'css',
  'javascript',
  'git',
  'sql',
  'bootstrap',
  'tailwind',
];

const strengthRank = {
  basic: 1,
  medium: 2,
  strong: 3,
};

const normalizeStrength = (raw) => {
  const value = String(raw || '').toLowerCase().trim();
  if (!value) return null;

  if (['strong', 'advanced', 'expert'].includes(value)) return 'strong';
  if (['medium', 'intermediate'].includes(value)) return 'medium';
  if (['basic', 'weak', 'beginner', 'novice'].includes(value)) return 'basic';

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    if (numeric >= 80) return 'strong';
    if (numeric >= 45) return 'medium';
    return 'basic';
  }

  return null;
};

export const getSkillName = (skill) => {
  if (typeof skill === 'string') return skill;
  return String(skill?.name || skill?.skill || skill?.title || '').trim();
};

const inferStrengthFromName = (name) => {
  const normalized = String(name || '').toLowerCase();
  if (!normalized) return 'basic';

  if (strongKeywords.some((k) => normalized.includes(k))) return 'strong';
  if (mediumKeywords.some((k) => normalized.includes(k))) return 'medium';
  return 'basic';
};

export const getStrength = (skill) => {
  const provided = normalizeStrength(
    skill?.strength
    ?? skill?.proficiency
    ?? skill?.level,
  );

  const inferred = inferStrengthFromName(getSkillName(skill));

  if (!provided) return inferred;

  // Keep stronger inferred signal when backend provides generic/default levels.
  return (strengthRank[inferred] > strengthRank[provided]) ? inferred : provided;
};
