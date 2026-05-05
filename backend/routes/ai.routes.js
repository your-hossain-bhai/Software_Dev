const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadPdf, handleMulterError } = require('../middleware/upload');
const {
  extractSkills,
  extractSkillsFromPDF,
  mergeSkills,
  generateRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  careerBot,
} = require('../controllers/ai.controller');

router.post('/extract-skills', protect, extractSkills);
router.post('/extract-skills-pdf', protect, uploadPdf.single('cv'), handleMulterError, extractSkillsFromPDF);
router.post('/merge-skills', protect, mergeSkills);
router.post('/roadmap', protect, generateRoadmap);
router.get('/roadmap', protect, getUserRoadmaps);
router.get('/roadmap/:id', protect, getRoadmapById);
router.post('/career-bot', protect, careerBot);

module.exports = router;
