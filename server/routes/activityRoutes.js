const express = require('express');
const router = express.Router();
const { logActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

// @route POST /api/resource-activities (Student & Admin Activity Logging)
router.post('/', protect, logActivity);

module.exports = router;
