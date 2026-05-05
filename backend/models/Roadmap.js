const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  week: Number,
  topic: String,
  tasks: [String],
  projectIdeas: [String],
  jobApplicationTip: String,
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  duration: { type: Number, enum: [3, 6], required: true },
  steps: [stepSchema],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
