const Job = require('../models/Job');
const User = require('../models/User');
const { computeMatchScore, getSkillGaps, recommendResourcesForGaps } = require('../utils/matching');

function escapeRegex(input) {
  return String(input || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getAllJobs = async (req, res) => {
  try {
    const { role, location, type, experienceLevel } = req.query;
    let filter = {};
    if (role) filter.title = new RegExp(escapeRegex(role), 'i');
    if (location) filter.location = new RegExp(escapeRegex(location), 'i');
    if (type) filter.jobType = type;
    if (experienceLevel) filter.experienceLevel = experienceLevel;

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch jobs.' });
  }
};

exports.getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const jobs = await Job.find().sort({ createdAt: -1 });
    const userSkills = (user.skills || []).map((s) => s.name.toLowerCase());

    const scored = jobs.map((job) => {
      const { score, matches, missing, explanation } = computeMatchScore(user, job, userSkills);
      return {
        ...job.toObject(),
        matchScore: score,
        matchedSkills: matches,
        missingSkills: missing,
        explanation,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const recommended = scored.slice(0, 10);
    res.json(recommended);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get recommended jobs.' });
  }
};

exports.getJobMatchDetail = async (req, res) => {
  try {
    if (!req.params.id || !req.params.id.match(/^[a-f\d]{24}$/i)) {
      return res.status(400).json({ message: 'Invalid job ID.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const userSkills = (user.skills || []).map((s) => s.name.toLowerCase());
    const { score, matches, missing, explanation } = computeMatchScore(user, job, userSkills);
    const gaps = getSkillGaps(missing);
    const resourceRecs = await recommendResourcesForGaps(gaps);

    res.json({
      job,
      matchScore: score,
      matchedSkills: matches,
      missingSkills: missing,
      explanation,
      skillGaps: gaps,
      recommendedResources: resourceRecs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get match detail.' });
  }
};
