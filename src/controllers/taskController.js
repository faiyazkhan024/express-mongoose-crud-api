const Task = require('../models/taskModel');
const AppError = require('../errors/AppError');

/**
 * @desc    Create a new task
 * @route   POST /api/v1/tasks
 * @access  Public
 */
const createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks with filtering, search, sorting, and pagination
 * @route   GET /api/v1/tasks
 * @access  Public
 */
const getAllTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      assigneeEmail,
      tag,
      search,
      isArchived,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};

    // By default, filter out archived unless explicitly requested
    if (isArchived !== undefined) {
      filter.isArchived = isArchived === 'true';
    } else {
      filter.isArchived = false;
    }

    if (status) {
      filter.status = status.toLowerCase().trim();
    }

    if (priority) {
      filter.priority = priority.toLowerCase().trim();
    }

    if (category) {
      filter.category = category.toLowerCase().trim();
    }

    if (assigneeEmail) {
      filter['assignee.email'] = assigneeEmail.toLowerCase().trim();
    }

    if (tag) {
      filter.tags = tag.toLowerCase().trim();
    }

    if (search) {
      filter.$text = { $search: search.trim() };
    }

    // Build sort
    const sort = { [sortBy]: sortOrder.toLowerCase() === 'asc' ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limitNum),
      Task.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/v1/tasks/:id
 * @access  Public
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError(`Task not found with id '${req.params.id}'`, 404));
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Full update of a task (PUT)
 * @route   PUT /api/v1/tasks/:id
 * @access  Public
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return next(new AppError(`Task not found with id '${req.params.id}'`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Partial update of a task (PATCH)
 * @route   PATCH /api/v1/tasks/:id
 * @access  Public
 */
const partialUpdateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return next(new AppError(`Task not found with id '${req.params.id}'`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Task partially updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Public
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return next(new AppError(`Task not found with id '${req.params.id}'`, 404));
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated task metrics and analytics
 * @route   GET /api/v1/tasks/analytics
 * @access  Public
 */
const getTaskAnalytics = async (req, res, next) => {
  try {
    const [analytics] = await Task.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                totalEstimatedHours: { $sum: '$estimatedHours' },
                totalActualHours: { $sum: '$actualHours' },
                completedCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
              }
            },
            {
              $project: {
                _id: 0,
                totalTasks: 1,
                totalEstimatedHours: 1,
                totalActualHours: 1,
                completedCount: 1,
                completionRate: {
                  $cond: [
                    { $gt: ['$totalTasks', 0] },
                    {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$completedCount', '$totalTasks'] },
                            100
                          ]
                        },
                        1
                      ]
                    },
                    0
                  ]
                }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            },
            { $project: { _id: 0, status: '$_id', count: 1 } },
            { $sort: { count: -1 } }
          ],
          byPriority: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            },
            { $project: { _id: 0, priority: '$_id', count: 1 } },
            { $sort: { count: -1 } }
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 }
              }
            },
            { $project: { _id: 0, category: '$_id', count: 1 } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);

    const defaultOverview = {
      totalTasks: 0,
      totalEstimatedHours: 0,
      totalActualHours: 0,
      completedCount: 0,
      completionRate: 0
    };

    res.status(200).json({
      success: true,
      data: {
        overview: (analytics && analytics.overview[0]) || defaultOverview,
        byStatus: (analytics && analytics.byStatus) || [],
        byPriority: (analytics && analytics.byPriority) || [],
        byCategory: (analytics && analytics.byCategory) || []
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  partialUpdateTask,
  deleteTask,
  getTaskAnalytics
};
