import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './logging/index.js';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info('GM Safaris API listening', {
    port: config.port,
    nodeEnv: config.nodeEnv,
    externalApiConfigured: config.externalApi.keys.length > 0,
  });
});

function shutdown(signal) {
  logger.info('Shutting down', { signal });
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
