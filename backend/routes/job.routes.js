const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllJobs,
  getRecommendedJobs,
  getJobMatchDetail,
} = require('../controllers/job.controller');

router.get('/', getAllJobs);
router.get('/recommended', protect, getRecommendedJobs);
router.get('/:id/match', protect, getJobMatchDetail);

module.exports = router;
