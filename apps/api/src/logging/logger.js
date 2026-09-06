/**
 * Structured logging. Correlation ID should be attached per request.
 * Never log passwords, tokens, API keys, or raw SQL with secrets.
 */

import { config } from '../config/index.js';

const LEVELS = Object.freeze({
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
});

const configuredLevel = LEVELS[config.logging.level] ?? LEVELS.info;

/**
 * @param {string} level
 * @param {string} message
 * @param {Record<string, unknown>} [meta]
 */
function write(level, message, meta = {}) {
  if ((LEVELS[level] ?? 99) > configuredLevel) return;

  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    service: 'gm-safaris-api',
    ...meta,
  };

  const line = config.logging.format === 'json' ? JSON.stringify(entry) : formatText(entry);

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console -- intentional structured logger sink
    console.log(line);
  }
}

/**
 * @param {Record<string, unknown>} entry
 */
function formatText(entry) {
  const { time, level, message, ...rest } = entry;
  const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
  return `${time} [${level}] ${message}${extra}`;
}

export const logger = {
  error: (message, meta) => write('error', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  info: (message, meta) => write('info', message, meta),
  debug: (message, meta) => write('debug', message, meta),
};

export default logger;
