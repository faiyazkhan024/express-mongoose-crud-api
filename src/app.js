const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { getDBStatus } = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: {
      status: dbStatus
    }
  });
});

// Centralized error handling
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
