const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  source: { type: String, enum: ['manual', 'cv'], default: 'manual' },
  strength: { type: String, enum: ['basic', 'medium', 'strong'], default: 'medium' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  permissions: { type: [String], default: [] },
  education: { type: String, default: '' },
  experienceLevel: { type: String, enum: ['Fresher', 'Junior', 'Mid'], default: 'Fresher' },
  preferredTrack: { type: String, default: 'Web' },
  skills: [skillSchema],
  cvText: { type: String, default: '' },
  interests: [String],
  avatar: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
