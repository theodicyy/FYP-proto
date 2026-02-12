const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

const currentLogLevel = process.env.LOG_LEVEL || 'info'

const levelMap = {
  error: LOG_LEVELS.ERROR,
  warn: LOG_LEVELS.WARN,
  info: LOG_LEVELS.INFO,
  debug: LOG_LEVELS.DEBUG
}

const shouldLog = level => {
  const currentLevel =
    levelMap[currentLogLevel.toLowerCase()] ?? LOG_LEVELS.INFO

  const messageLevel =
    levelMap[level.toLowerCase()] ?? LOG_LEVELS.INFO

  return messageLevel <= currentLevel
}

/*
====================================================
SAFE FORMATTER (NO MORE CRASHES)
====================================================
*/

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString()

  let metaStr = ''

  if (meta && typeof meta === 'object' && Object.keys(meta).length > 0) {
    metaStr = ` ${JSON.stringify(meta)}`
  }

  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
}

export const logger = {
  error: (message, meta = null) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta))
    }
  },

  warn: (message, meta = null) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta))
    }
  },

  info: (message, meta = null) => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, meta))
    }
  },

  debug: (message, meta = null) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, meta))
    }
  }
}

export default logger
