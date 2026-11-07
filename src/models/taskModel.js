const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true,
      minlength: [2, 'Subtask title must be at least 2 characters long'],
      maxlength: [150, 'Subtask title cannot exceed 150 characters']
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const assigneeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Assignee name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid assignee email address']
    }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters long'],
      maxlength: [120, 'Task title cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['backlog', 'todo', 'in_progress', 'in_review', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid status'
      },
      default: 'todo',
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid priority level'
      },
      default: 'medium',
      index: true
    },
    category: {
      type: String,
      enum: {
        values: ['feature', 'bug', 'refactor', 'documentation', 'maintenance', 'devops'],
        message: '{VALUE} is not a valid category'
      },
      default: 'feature',
      index: true
    },
    assignee: {
      type: assigneeSchema,
      default: null
    },
    tags: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: []
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
      default: 0
    },
    actualHours: {
      type: Number,
      min: [0, 'Actual hours cannot be negative'],
      default: 0
    },
    dueDate: {
      type: Date,
      default: null
    },
    subtasks: {
      type: [subtaskSchema],
      default: []
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Compound and search indexes
taskSchema.index({ status: 1, priority: 1, dueDate: 1 });
taskSchema.index({ 'assignee.email': 1, status: 1 });
taskSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for overdue check
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate) return false;
  const isFinished = ['completed', 'cancelled'].includes(this.status);
  return !isFinished && new Date() > this.dueDate;
});

// Virtual for progress metrics
taskSchema.virtual('subtaskCount').get(function () {
  return this.subtasks ? this.subtasks.length : 0;
});

taskSchema.virtual('completedSubtaskCount').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) return 0;
  return this.subtasks.filter((subtask) => subtask.isCompleted).length;
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
