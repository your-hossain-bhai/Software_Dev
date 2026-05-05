const express = require('express');
const router = express.Router();
const { getAllResources } = require('../controllers/resource.controller');

router.get('/', getAllResources);

module.exports = router;
