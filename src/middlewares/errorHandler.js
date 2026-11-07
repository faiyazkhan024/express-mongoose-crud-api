const AppError = require('../errors/AppError');
const config = require('../config');

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl} - Endpoint not found`, 404));
};

/**
 * Global centralized error handler
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': ${err.value}`;
  }

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for '${field}'. A record with this value already exists.`;
  }

  // Handle Mongoose Schema ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  const isDev = config.nodeEnv === 'development';
  if (statusCode === 500 && !isDev) {
    message = 'An unexpected internal server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
    ...(errors && { errors }),
    ...(isDev && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
