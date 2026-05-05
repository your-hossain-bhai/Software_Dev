const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role || 'user',
      permissions: user.permissions || [],
    },
    config.jwtSecret,
    { expiresIn: '30d' }
  );
};

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      education,
      experienceLevel,
      preferredTrack,
      interests,
    } = req.body;

    const cleanName = normalizeString(name);
    const cleanEmail = normalizeString(email).toLowerCase();
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long.' });
    }

    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const normalizedInterests = Array.isArray(interests)
      ? interests.map((item) => normalizeString(item)).filter(Boolean)
      : [];

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'user',
      permissions: [],
      education: normalizeString(education),
      experienceLevel: experienceLevel || 'Fresher',
      preferredTrack: preferredTrack || 'Web',
      interests: normalizedInterests,
    });
    res.status(201).json({
      user,
      token: generateToken(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    res.status(500).json({ message: 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const cleanEmail = normalizeString(req.body?.email).toLowerCase();
    const cleanPassword = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!EMAIL_RE.test(cleanEmail) || !cleanPassword) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.comparePassword(cleanPassword))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // Remove password before sending response
    const userResponse = user.toJSON();
    res.json({
      user: userResponse,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.' });
  }
};
