const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrCreateSession,
  getSessions,
  createSession,
  getHistory,
  chat,
  deleteSession,
} = require('../controllers/careerbot.controller');

// All routes require authentication
router.use(protect);

// Session management
router.get('/session', getOrCreateSession);
router.get('/sessions', getSessions);
router.post('/session', createSession);
router.delete('/session/:sessionId', deleteSession);

// Chat
router.post('/chat', chat);
router.get('/history/:sessionId', getHistory);

module.exports = router;
