const express = require('express');
const router = express.Router();
const { logActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/log', logActivity);

module.exports = router;