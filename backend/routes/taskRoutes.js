const express = require('express');
const router = express.Router();
const { getTasks, getTodayTasks, createTask, updateTask, completeTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all task routes require auth

router.get('/',           getTasks);
router.get('/today',      getTodayTasks);
router.post('/',          createTask);
router.put('/:id',        updateTask);
router.put('/:id/complete', completeTask);
router.delete('/:id',     deleteTask);

module.exports = router;