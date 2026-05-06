require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { requestLogger, logger } = require('./middleware/logger');
const scheduleRoutes = require('./routes/scheduleRoutes');

// Check for required env vars early on
const requiredEnv = ['PORT', 'DEPOTS_API', 'VEHICLES_API', 'TOKEN'];
const missing = requiredEnv.filter((env) => !process.env[env]);

if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Setup middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Mount routes
app.use('/api', scheduleRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found - ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist. Available routes: GET /api/schedule, GET /api/health'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Graceful shutdown handling
const shutdown = () => {
  logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason.message || reason}`, { stack: reason.stack || '' });
});

module.exports = app;
