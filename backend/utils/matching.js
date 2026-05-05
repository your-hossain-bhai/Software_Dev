const Resource = require('../models/Resource');

function normalizeSkillText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandSkillAliases(skill) {
  const normalized = normalizeSkillText(skill);
  const aliases = new Set([normalized]);

  const aliasMap = {
    'js': ['javascript'],
    'javascript': ['js'],
    'ts': ['typescript'],
    'typescript': ['ts'],
    'react native': ['react-native', 'reactnative'],
    'node': ['node js', 'nodejs'],
    'node js': ['node', 'nodejs'],
    'ui ux': ['ui', 'ux', 'ui design', 'ux design'],
    'machine learning': ['ml'],
    'ml': ['machine learning'],
  };

  const mapped = aliasMap[normalized] || [];
  mapped.forEach((item) => aliases.add(normalizeSkillText(item)));
  return aliases;
}

function skillMatches(userSkillSet, requiredSkill) {
  const reqAliases = expandSkillAliases(requiredSkill);
  for (const alias of reqAliases) {
    if (!alias) continue;
    if (userSkillSet.has(alias)) return true;
  }
  return false;
}


function computeMatchScore(user, job, userSkills = null) {
  const rawSkills = userSkills || (user.skills || []).map((s) => s.name);
  const expandedUserSkills = new Set();
  rawSkills.forEach((skill) => {
    expandSkillAliases(skill).forEach((alias) => expandedUserSkills.add(alias));
  });

  const jobSkills = (job.requiredSkills || []).map((s) => normalizeSkillText(s)).filter(Boolean);

  let skillPoints = 0;
  const maxSkillPoints = 50;
  const perSkillPoint = jobSkills.length > 0 ? maxSkillPoints / jobSkills.length : 0;

  const matches = [];
  const missing = [];

  for (const js of jobSkills) {
    const found = skillMatches(expandedUserSkills, js);
    if (found) {
      matches.push(js);
      skillPoints += perSkillPoint;
    } else {
      missing.push(js);
    }
  }

  let expPoints = 0;
  const expOrder = { Fresher: 0, Junior: 1, Mid: 2 };
  const userExp = expOrder[user.experienceLevel] ?? 0;
  const jobExp = expOrder[job.experienceLevel] ?? 0;
  if (userExp <= jobExp) {
    expPoints = 25;
  } else if (userExp === jobExp + 1) {
    expPoints = 15;
  } else {
    expPoints = 5;
  }

  let trackPoints = 0;
  const userTrack = (user.preferredTrack || '').toLowerCase();
  const jobTitle = (job.title || '').toLowerCase();
  const trackKeywords = ['web', 'frontend', 'backend', 'fullstack', 'data', 'design', 'mobile'];
  const userTrackMatch = trackKeywords.some((k) => userTrack.includes(k));
  const jobTrackMatch = trackKeywords.some((k) => jobTitle.includes(k));
  const tracksOverlap = trackKeywords.some((k) => userTrack.includes(k) && jobTitle.includes(k));
  if (userTrackMatch && jobTrackMatch && tracksOverlap) {
    trackPoints = 25;
  } else if (userTrackMatch || jobTrackMatch) {
    trackPoints = 12;
  }

  const score = Math.round(Math.min(100, skillPoints + expPoints + trackPoints));
  let explanation = [];
  if (matches.length) explanation.push(`Matches: ${matches.join(', ')}`);
  if (missing.length) explanation.push(`Missing: ${missing.join(', ')}`);
  explanation.push(`Experience: ${user.experienceLevel} vs ${job.experienceLevel} (${expPoints}/25)`);
  explanation.push(`Track: ${user.preferredTrack} vs ${job.title} (${trackPoints}/25)`);

  return {
    score,
    matches,
    missing,
    explanation: explanation.join('; '),
  };
}

function getSkillGaps(missingSkills) {
  return missingSkills || [];
}

async function recommendResourcesForGaps(gaps) {
  if (!gaps || gaps.length === 0) return [];
  const orConditions = gaps.map((s) => ({ skills: new RegExp(s, 'i') }));
  return Resource.find({ $or: orConditions }).limit(8).lean();
}

module.exports = {
  computeMatchScore,
  getSkillGaps,
  recommendResourcesForGaps,
};
