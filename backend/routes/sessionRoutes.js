const express = require('express');
const router = express.Router();
const { startSession, pauseSession, resumeSession, endSession, getCurrentSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start',        startSession);
router.get('/current',       getCurrentSession);
router.put('/:id/pause',     pauseSession);
router.put('/:id/resume',    resumeSession);
router.put('/:id/end',       endSession);

module.exports = router;