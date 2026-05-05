const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  jobType: { type: String, enum: ['Internship', 'Part-time', 'Full-time', 'Freelance'], default: 'Full-time' },
  experienceLevel: { type: String, enum: ['Fresher', 'Junior', 'Mid'], default: 'Junior' },
  requiredSkills: [String],
  applyLinks: [{
    platform: String,
    url: String,
  }],
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
