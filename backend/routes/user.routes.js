const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { getProfile, updateProfile } = require('../controllers/user.controller');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), handleMulterError, updateProfile);

module.exports = router;
