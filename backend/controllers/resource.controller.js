const Resource = require('../models/Resource');

function escapeRegex(input) {
  return String(input || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getAllResources = async (req, res) => {
  try {
    const { skill, cost, platform } = req.query;
    let filter = {};
    if (skill) filter.skills = new RegExp(escapeRegex(skill), 'i');
    if (cost) filter.cost = cost;
    if (platform) filter.platform = new RegExp(escapeRegex(platform), 'i');

    const resources = await Resource.find(filter).sort({ cost: 1, title: 1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch resources.' });
  }
};
