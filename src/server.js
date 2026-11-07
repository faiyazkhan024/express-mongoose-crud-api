const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`[Server] Running on port ${config.port} in ${config.nodeEnv} mode`);
});

const handleShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('[Server] Closed out remaining connections.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = server;
