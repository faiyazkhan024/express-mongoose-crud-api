const mongoose = require('mongoose');
const AppError = require('../errors/AppError');

const ALLOWED_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'completed', 'cancelled'];
const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const ALLOWED_CATEGORIES = ['feature', 'bug', 'refactor', 'documentation', 'maintenance', 'devops'];
const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title', 'estimatedHours', 'actualHours'];

/**
 * Validate MongoDB ObjectId param
 */
const validateObjectIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(`Invalid task ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`, 400));
  }
  next();
};

/**
 * Validate Task input fields
 */
const validateTaskFields = (body, isPartial = false) => {
  const errors = [];
  const {
    title,
    description,
    status,
    priority,
    category,
    assignee,
    tags,
    estimatedHours,
    actualHours,
    dueDate,
    subtasks
  } = body;

  // Title validation
  if (!isPartial || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required and cannot be empty.' });
    } else if (title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters long.' });
    } else if (title.trim().length > 120) {
      errors.push({ field: 'title', message: 'Title cannot exceed 120 characters.' });
    }
  }

  // Description validation
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string.' });
    } else if (description.trim().length > 2000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 2000 characters.' });
    }
  }

  // Status validation
  if (!isPartial || status !== undefined) {
    if (status !== undefined && (!status || typeof status !== 'string' || !ALLOWED_STATUSES.includes(status.toLowerCase().trim()))) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`
      });
    }
  }

  // Priority validation
  if (!isPartial || priority !== undefined) {
    if (priority !== undefined && (!priority || typeof priority !== 'string' || !ALLOWED_PRIORITIES.includes(priority.toLowerCase().trim()))) {
      errors.push({
        field: 'priority',
        message: `Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}.`
      });
    }
  }

  // Category validation
  if (!isPartial || category !== undefined) {
    if (category !== undefined && (!category || typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category.toLowerCase().trim()))) {
      errors.push({
        field: 'category',
        message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`
      });
    }
  }

  // Assignee validation
  if (assignee !== undefined && assignee !== null) {
    if (typeof assignee !== 'object' || Array.isArray(assignee)) {
      errors.push({ field: 'assignee', message: 'Assignee must be an object with name and email.' });
    } else {
      if (assignee.email && typeof assignee.email === 'string') {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(assignee.email.trim())) {
          errors.push({ field: 'assignee.email', message: 'Assignee email must be a valid email address.' });
        }
      }
      if (assignee.name && typeof assignee.name !== 'string') {
        errors.push({ field: 'assignee.name', message: 'Assignee name must be a string.' });
      }
    }
  }

  // Tags validation
  if (tags !== undefined && tags !== null) {
    if (!Array.isArray(tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array of strings.' });
    } else if (tags.some((tag) => typeof tag !== 'string')) {
      errors.push({ field: 'tags', message: 'All tag items must be strings.' });
    }
  }

  // Estimated hours validation
  if (estimatedHours !== undefined && estimatedHours !== null) {
    const num = Number(estimatedHours);
    if (isNaN(num) || num < 0) {
      errors.push({ field: 'estimatedHours', message: 'Estimated hours must be a non-negative number.' });
    }
  }

  // Actual hours validation
  if (actualHours !== undefined && actualHours !== null) {
    const num = Number(actualHours);
    if (isNaN(num) || num < 0) {
      errors.push({ field: 'actualHours', message: 'Actual hours must be a non-negative number.' });
    }
  }

  // Due Date validation
  if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
    const parsedDate = Date.parse(dueDate);
    if (isNaN(parsedDate)) {
      errors.push({ field: 'dueDate', message: 'Due date must be a valid ISO date string.' });
    }
  }

  // Subtasks validation
  if (subtasks !== undefined && subtasks !== null) {
    if (!Array.isArray(subtasks)) {
      errors.push({ field: 'subtasks', message: 'Subtasks must be an array of objects.' });
    } else {
      subtasks.forEach((sub, idx) => {
        if (!sub || typeof sub !== 'object') {
          errors.push({ field: `subtasks[${idx}]`, message: 'Subtask must be an object.' });
        } else {
          if (!sub.title || typeof sub.title !== 'string' || sub.title.trim().length === 0) {
            errors.push({ field: `subtasks[${idx}].title`, message: 'Subtask title is required.' });
          }
          if (sub.isCompleted !== undefined && typeof sub.isCompleted !== 'boolean') {
            errors.push({ field: `subtasks[${idx}].isCompleted`, message: 'Subtask isCompleted must be boolean.' });
          }
        }
      });
    }
  }

  return errors;
};

/**
 * Validate POST /tasks
 */
const validateCreateTask = (req, res, next) => {
  const errors = validateTaskFields(req.body, false);
  if (errors.length > 0) {
    return next(new AppError('Task validation failed', 400, errors));
  }
  next();
};

/**
 * Validate PUT /tasks/:id
 */
const validateUpdateTask = (req, res, next) => {
  const errors = validateTaskFields(req.body, false);
  if (errors.length > 0) {
    return next(new AppError('Task update validation failed', 400, errors));
  }
  next();
};

/**
 * Validate PATCH /tasks/:id
 */
const validatePartialUpdateTask = (req, res, next) => {
  const allowedKeys = [
    'title',
    'description',
    'status',
    'priority',
    'category',
    'assignee',
    'tags',
    'estimatedHours',
    'actualHours',
    'dueDate',
    'subtasks',
    'isArchived'
  ];

  const providedKeys = Object.keys(req.body).filter((k) => allowedKeys.includes(k));
  if (providedKeys.length === 0) {
    return next(new AppError('At least one valid field must be provided for partial update.', 400));
  }

  const errors = validateTaskFields(req.body, true);
  if (errors.length > 0) {
    return next(new AppError('Task partial update validation failed', 400, errors));
  }
  next();
};

/**
 * Validate Query Params for GET /tasks
 */
const validateQueryParams = (req, res, next) => {
  const errors = [];
  const { page, limit, status, priority, category, sortBy, sortOrder } = req.query;

  if (page !== undefined) {
    const p = parseInt(page, 10);
    if (isNaN(p) || p < 1) {
      errors.push({ field: 'page', message: 'Page must be a positive integer >= 1.' });
    }
  }

  if (limit !== undefined) {
    const l = parseInt(limit, 10);
    if (isNaN(l) || l < 1 || l > 100) {
      errors.push({ field: 'limit', message: 'Limit must be an integer between 1 and 100.' });
    }
  }

  if (status && !ALLOWED_STATUSES.includes(status.toLowerCase().trim())) {
    errors.push({ field: 'status', message: `Status filter must be one of: ${ALLOWED_STATUSES.join(', ')}.` });
  }

  if (priority && !ALLOWED_PRIORITIES.includes(priority.toLowerCase().trim())) {
    errors.push({ field: 'priority', message: `Priority filter must be one of: ${ALLOWED_PRIORITIES.join(', ')}.` });
  }

  if (category && !ALLOWED_CATEGORIES.includes(category.toLowerCase().trim())) {
    errors.push({ field: 'category', message: `Category filter must be one of: ${ALLOWED_CATEGORIES.join(', ')}.` });
  }

  if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
    errors.push({ field: 'sortBy', message: `SortBy must be one of: ${ALLOWED_SORT_FIELDS.join(', ')}.` });
  }

  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    errors.push({ field: 'sortOrder', message: 'SortOrder must be either "asc" or "desc".' });
  }

  if (errors.length > 0) {
    return next(new AppError('Invalid query parameters', 400, errors));
  }
  next();
};

module.exports = {
  validateObjectIdParam,
  validateCreateTask,
  validateUpdateTask,
  validatePartialUpdateTask,
  validateQueryParams,
  ALLOWED_STATUSES,
  ALLOWED_PRIORITIES,
  ALLOWED_CATEGORIES,
  ALLOWED_SORT_FIELDS
};
