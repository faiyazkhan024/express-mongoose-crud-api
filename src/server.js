const app = require('./app');
const config = require('./config');
const { connectDB, disconnectDB } = require('./config/db');

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(`[Server] Running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }

  setTimeout(() => {
    console.error('[Server] Forceful shutdown initiated after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();

module.exports = server;
