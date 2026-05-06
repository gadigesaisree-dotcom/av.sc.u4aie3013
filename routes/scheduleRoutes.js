const express = require('express');
const router = express.Router();
const { buildSchedule } = require('../services/schedulerService');
const { logger } = require('../middleware/logger');

const startTime = Date.now();

/**
 * GET /api/health
 * Liveness probe returning status and uptime.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    uptime: (Date.now() - startTime) / 1000,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/schedule
 * Runs the vehicle scheduling process for all depots.
 */
router.get('/schedule', async (req, res, next) => {
  try {
    const schedule = await buildSchedule();
    res.status(200).json(schedule);
  } catch (error) {
    logger.error('Failed to generate schedule', { error: error.message, stack: error.stack });
    next(error);
  }
});

module.exports = router;
