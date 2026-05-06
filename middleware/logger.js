const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');

/**
 * Helper to write a log line to the file.
 * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
 * @param {string} message - The main log message
 * @param {Object} [meta] - Optional extra data
 */
const writeLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  let logLine = `[${timestamp}] [${level}] ${message}`;
  
  if (Object.keys(meta).length > 0) {
    logLine += `  ${JSON.stringify(meta)}`;
  }
  
  logLine += '\n';
  
  try {
    fs.appendFileSync(logFile, logLine);
  } catch (err) {
    // We can't use console.log as per requirements, 
    // but typically we'd fallback to process.stderr here.
    process.stderr.write(`Failed to write to log file: ${err.message}\n`);
  }
};

const logger = {
  info: (message, meta) => writeLog('INFO', message, meta),
  warn: (message, meta) => writeLog('WARN', message, meta),
  error: (message, meta) => writeLog('ERROR', message, meta),
  debug: (message, meta) => writeLog('DEBUG', message, meta),
};

/**
 * Express middleware to log incoming and completed requests.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // When request finishes, log outcome
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Completed request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration
    });
  });

  next();
};

module.exports = { logger, requestLogger };
