const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL || 'info';
const levelMap = {
  error: LOG_LEVELS.ERROR,
  warn: LOG_LEVELS.WARN,
  info: LOG_LEVELS.INFO,
  debug: LOG_LEVELS.DEBUG
};

const shouldLog = (level) => {
  const currentLevel = levelMap[currentLogLevel.toLowerCase()] || LOG_LEVELS.INFO;
  const messageLevel = levelMap[level.toLowerCase()] || LOG_LEVELS.INFO;
  return messageLevel <= currentLevel;
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

export const logger = {
  error: (message, meta) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta));
    }
  },
  warn: (message, meta) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  info: (message, meta) => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, meta));
    }
  },
  debug: (message, meta) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, meta));
    }
  }
};

export default logger;
