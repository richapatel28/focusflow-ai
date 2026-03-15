const express = require('express');
const router = express.Router();
const { getDashboard, getWeekly, generateReport } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/weekly',    getWeekly);
router.post('/generate', generateReport);

module.exports = router;