const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Parse JSON fields sent as strings in FormData
    let { name, education, experienceLevel, preferredTrack, skills, cvText, interests } = req.body;
    
    // Parse skills and interests if they're JSON strings (from FormData)
    if (typeof skills === 'string') {
      try {
        skills = JSON.parse(skills);
      } catch {
        skills = undefined;
      }
    }
    if (typeof interests === 'string') {
      try {
        interests = JSON.parse(interests);
      } catch {
        interests = undefined;
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (education !== undefined) updates.education = education;
    if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;
    if (preferredTrack !== undefined) updates.preferredTrack = preferredTrack;
    if (skills !== undefined) updates.skills = skills;
    if (cvText !== undefined) updates.cvText = cvText;
    if (interests !== undefined) updates.interests = interests;

    // Handle avatar upload - convert to base64 for storage
    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      updates.avatar = base64Image;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update profile.' });
  }
};
