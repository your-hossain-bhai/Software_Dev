const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const { extractSkillsFromText } = require('../utils/skillExtractor');
const { generateRoadmapSteps } = require('../utils/roadmapGenerator');
const { getBotResponse } = require('../utils/careerBot');
const pdfParse = require('pdf-parse');

/**
 * Skill Extraction from CV text
 * How it works: Keyword-based scanning of CV text against a known skill list.
 * Extracted skills are editable by the user before saving.
 */
exports.extractSkills = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required for extraction.' });
    }
    const skills = extractSkillsFromText(text);
    res.json({
      skills,
      explanation: 'Extraction uses keyword matching against common tech skills (programming, frameworks, tools). You can edit or remove any skill before saving.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Extraction failed.' });
  }
};

/**
 * Merge extracted skills with existing, avoiding duplicates
 */
exports.mergeSkills = async (req, res) => {
  try {
    const { extractedSkills } = req.body;
    const user = await User.findById(req.user._id);
    const existing = (user.skills || []).map((s) => s.name.toLowerCase());
    const merged = [...user.skills];
    const seen = new Set(existing);

    for (const s of extractedSkills || []) {
      const name = (s.name || s).toLowerCase();
      if (!seen.has(name)) {
        seen.add(name);
        merged.push({
          name: s.name || s,
          source: s.source || 'cv',
          strength: s.strength || 'medium',
        });
      }
    }

    user.skills = merged;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Merge failed.' });
  }
};

/**
 * Generate and save Career Roadmap
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const durationMonths = Number(req.body?.duration);
    const targetRole = String(req.body?.targetRole || '').trim();

    if (!targetRole || !durationMonths || ![3, 6].includes(durationMonths)) {
      return res.status(400).json({
        message: 'targetRole and duration (3 or 6 months) are required.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentSkills = (user.skills || []).map((s) => s.name);
    const steps = generateRoadmapSteps(targetRole, durationMonths, currentSkills);

    const roadmap = await Roadmap.create({
      userId: req.user._id,
      targetRole,
      duration: durationMonths,
      steps,
    });

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Roadmap generation failed.' });
  }
};

exports.getUserRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch roadmaps.' });
  }
};

exports.getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch roadmap.' });
  }
};

/**
 * CareerBot - Career Q&A
 */
exports.careerBot = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ message: 'Question is required.' });
    }
    const { answer, disclaimer } = getBotResponse(question);
    res.json({
      answer,
      disclaimer,
      note: 'Responses are suggestive. For personalized advice, consult a career counselor.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'CareerBot failed.' });
  }
};

/**
 * Extract skills from uploaded PDF CV
 */
exports.extractSkillsFromPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required.' });
    }

    if (!req.file.buffer || !Buffer.isBuffer(req.file.buffer)) {
      return res.status(400).json({ message: 'Uploaded file buffer is missing. Use multer memory storage.' });
    }

    // Parse PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text || '';

    if (!extractedText.trim()) {
      return res.status(400).json({ 
        message: 'Could not extract text from PDF. The file may be scanned or image-based.' 
      });
    }

    // Extract skills from the text
    const skills = extractSkillsFromText(extractedText);

    res.json({
      skills,
      extractedText: extractedText.substring(0, 5000), // Return first 5000 chars for preview
      explanation: 'Extraction uses keyword matching against common tech skills from your PDF.',
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ message: error.message || 'Failed to extract skills from PDF.' });
  }
};
