const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: { type: String, required: true },
  url: { type: String, required: true },
  skills: [String],
  cost: { type: String, enum: ['Free', 'Paid'], default: 'Free' },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
