const axios = require('axios');
const { logger } = require('../middleware/logger');
const { knapsack } = require('../utils/knapsack');

// Create a shared Axios instance with predefined settings
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${process.env.TOKEN}`
  }
});

// Interceptor to log external API calls
apiClient.interceptors.request.use((config) => {
  logger.info('External API call started', { method: config.method.toUpperCase(), url: config.url });
  return config;
});

/**
 * Normalizes a raw depot object handling variations in keys.
 * @param {Object} raw - The raw depot object.
 * @returns {Object} Normalized depot object.
 */
const normalizeDepot = (raw) => {
  return {
    id: raw.id || raw.depotId || raw._id,
    mechanicHours: raw.mechanicHours || raw.hours || raw.capacity || raw.totalHours
  };
};

/**
 * Normalizes a raw task object handling variations in keys.
 * @param {Object} raw - The raw task object.
 * @returns {Object} Normalized task object.
 */
const normalizeTask = (raw) => {
  return {
    // Spread original to retain any extra fields just in case
    ...raw,
    id: raw.id || raw.taskId || raw._id,
    duration: raw.duration || raw.durationHours || raw.hours,
    impactScore: raw.impactScore || raw.impact || raw.score || raw.priority
  };
};

/**
 * Fetches depots and tasks, normalizes them, and optimizes schedules using 0/1 Knapsack.
 * @returns {Promise<Array>} The schedule results per depot.
 */
const buildSchedule = async () => {
  logger.info('Starting fetch for depots and tasks');

  // Fetch concurrently
  const [depotsRes, tasksRes] = await Promise.all([
    apiClient.get(process.env.DEPOTS_API),
    apiClient.get(process.env.VEHICLES_API)
  ]);

  const rawDepots = depotsRes.data.depots || depotsRes.data || [];
  const rawTasks = tasksRes.data.vehicles || tasksRes.data.tasks || tasksRes.data || [];

  logger.info('Fetch success', { 
    depotsCount: rawDepots.length, 
    tasksCount: rawTasks.length 
  });

  const depots = rawDepots.map(normalizeDepot);
  const tasks = rawTasks.map(normalizeTask);

  const scheduleResults = depots.map(depot => {
    logger.info(`Starting optimisation for depot`, { depotId: depot.id });

    // Run the knapsack algorithm for this specific depot
    const result = knapsack(tasks, depot.mechanicHours);

    logger.info(`Optimisation complete for depot`, {
      depotId: depot.id,
      impact: result.totalImpact,
      usedHours: result.usedHours,
      selectedCount: result.selectedTasks.length
    });

    return {
      depotId: depot.id,
      mechanicHours: depot.mechanicHours,
      usedHours: result.usedHours,
      remainingHours: result.remainingHours,
      totalImpact: result.totalImpact,
      selectedTasks: result.selectedTasks
    };
  });

  return scheduleResults;
};

module.exports = { buildSchedule };
