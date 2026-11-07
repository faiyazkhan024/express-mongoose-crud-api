const express = require('express');
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  partialUpdateTask,
  deleteTask,
  getTaskAnalytics
} = require('../controllers/taskController');

const {
  validateObjectIdParam,
  validateCreateTask,
  validateUpdateTask,
  validatePartialUpdateTask,
  validateQueryParams
} = require('../middlewares/validateTask');

// Analytics summary route - MUST be declared before /:id parameter route
router.get('/analytics', getTaskAnalytics);

// Collection routes
router
  .route('/')
  .get(validateQueryParams, getAllTasks)
  .post(validateCreateTask, createTask);

// Member routes by ID
router
  .route('/:id')
  .get(validateObjectIdParam, getTaskById)
  .put(validateObjectIdParam, validateUpdateTask, updateTask)
  .patch(validateObjectIdParam, validatePartialUpdateTask, partialUpdateTask)
  .delete(validateObjectIdParam, deleteTask);

module.exports = router;
