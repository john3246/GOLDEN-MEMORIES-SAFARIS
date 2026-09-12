/**
 * Load and validate shared configuration from an env object.
 * Apps may wrap this with dotenv; this package never reads .env files itself.
 */

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @param {string} name
 * @param {string} [fallback]
 * @returns {string}
 */
function envString(env, name, fallback) {
  const value = env[name];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${name}`);
}

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @param {string} name
 * @param {number} fallback
 * @returns {number}
 */
function envInt(env, name, fallback) {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    throw new Error(`Environment variable ${name} must be an integer`);
  }
  return n;
}

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @param {string} name
 * @param {boolean} fallback
 * @returns {boolean}
 */
function envBool(env, name, fallback) {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
}

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @param {string} name
 * @param {string[]} [fallback]
 * @returns {string[]}
 */
function envList(env, name, fallback = []) {
  const raw = env[name];
  if (raw === undefined || String(raw).trim() === '') return fallback;
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [env]
 */
export function loadConfig(env = process.env) {
  const nodeEnv = envString(env, 'NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  return Object.freeze({
    nodeEnv,
    isProduction,
    isDevelopment: nodeEnv === 'development',
    port: envInt(env, 'PORT', 3000),
    apiBaseUrl: envString(env, 'API_BASE_URL', 'http://localhost:3000'),
    servePublic: envBool(env, 'SERVE_PUBLIC', false),

    database: Object.freeze({
      host: envString(env, 'DATABASE_HOST', 'localhost'),
      port: envInt(env, 'DATABASE_PORT', 5432),
      name: envString(env, 'DATABASE_NAME', 'gm_safaris'),
      user: envString(env, 'DATABASE_USER', 'gm_safaris_app'),
      password: isProduction
        ? envString(env, 'DATABASE_PASSWORD')
        : envString(env, 'DATABASE_PASSWORD', 'change_me'),
      ssl: envBool(env, 'DATABASE_SSL', false),
      poolMin: envInt(env, 'DATABASE_POOL_MIN', 2),
      poolMax: envInt(env, 'DATABASE_POOL_MAX', 10),
    }),

    redis: Object.freeze({
      host: envString(env, 'REDIS_HOST', 'localhost'),
      port: envInt(env, 'REDIS_PORT', 6379),
      password: env.REDIS_PASSWORD || '',
      db: envInt(env, 'REDIS_DB', 0),
      keyPrefix: envString(env, 'REDIS_KEY_PREFIX', 'gm:safaris:'),
      ttlSeconds: envInt(env, 'REDIS_TTL_SECONDS', 300),
    }),

    auth: Object.freeze({
      jwtSecret: isProduction
        ? envString(env, 'JWT_SECRET')
        : envString(env, 'JWT_SECRET', 'dev_only_jwt_secret_change_in_production_32'),
      jwtExpiresIn: envString(env, 'JWT_EXPIRES_IN', '8h'),
      bcryptRounds: envInt(env, 'BCRYPT_ROUNDS', 12),
      sessionCookieSecure: envBool(env, 'SESSION_COOKIE_SECURE', isProduction),
    }),

    externalApi: Object.freeze({
      keys: envList(env, 'EXTERNAL_API_KEYS'),
      rateLimitWindowMs: envInt(env, 'EXTERNAL_API_RATE_LIMIT_WINDOW_MS', 60_000),
      rateLimitMax: envInt(env, 'EXTERNAL_API_RATE_LIMIT_MAX', 120),
    }),

    rateLimits: Object.freeze({
      auth: Object.freeze({
        windowMs: envInt(env, 'RATE_LIMIT_AUTH_WINDOW_MS', 900_000),
        max: envInt(env, 'RATE_LIMIT_AUTH_MAX', 20),
      }),
      public: Object.freeze({
        windowMs: envInt(env, 'RATE_LIMIT_PUBLIC_WINDOW_MS', 60_000),
        max: envInt(env, 'RATE_LIMIT_PUBLIC_MAX', 100),
      }),
      admin: Object.freeze({
        windowMs: envInt(env, 'RATE_LIMIT_ADMIN_WINDOW_MS', 60_000),
        max: envInt(env, 'RATE_LIMIT_ADMIN_MAX', 200),
      }),
    }),

    cors: Object.freeze({
      cms: envList(env, 'CORS_ORIGINS_CMS', [
        'http://localhost:5173',
        'https://golden-memories-safaris-2.onrender.com',
      ]),
      website: envList(env, 'CORS_ORIGINS_WEBSITE', [
        'http://localhost:4173',
        'http://localhost:4174',
        'https://golden-memories-safaris-2.onrender.com',
      ]),
      external: envList(env, 'CORS_ORIGINS_EXTERNAL', [
        'https://www.gmsafaris.co.tz',
        'https://gmsafaris.co.tz',
      ]),
    }),

    logging: Object.freeze({
      level: envString(env, 'LOG_LEVEL', isProduction ? 'info' : 'debug'),
      format: envString(env, 'LOG_FORMAT', 'json'),
    }),

    media: Object.freeze({
      uploadDir: envString(env, 'MEDIA_UPLOAD_DIR', './uploads'),
      maxFileSizeMb: envInt(env, 'MEDIA_MAX_FILE_SIZE_MB', 10),
      allowedMimeTypes: envList(env, 'MEDIA_ALLOWED_MIME_TYPES', [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ]),
    }),

    cms: Object.freeze({
      dataDir: envString(env, 'CMS_DATA_DIR', './data/cms'),
      adminEmail: envString(env, 'CMS_ADMIN_EMAIL', 'admin@gmsafaris.com'),
      adminPassword: envString(env, 'CMS_ADMIN_PASSWORD', 'ChangeMeAdmin!23'),
      editorEmail: envString(env, 'CMS_EDITOR_EMAIL', 'editor@gmsafaris.com'),
      editorPassword: envString(env, 'CMS_EDITOR_PASSWORD', 'ChangeMeEditor!23'),
      viewerEmail: envString(env, 'CMS_VIEWER_EMAIL', 'viewer@gmsafaris.com'),
      viewerPassword: envString(env, 'CMS_VIEWER_PASSWORD', 'ChangeMeViewer!23'),
      seedSafaris: envBool(env, 'CMS_SEED_SAFARIS', true),
    }),

    sites: Object.freeze({
      com: envString(env, 'SITE_URL_COM', 'https://www.gmsafaris.com'),
      cotz: envString(env, 'SITE_URL_COTZ', 'https://www.gmsafaris.co.tz'),
    }),
  });
}

export { envString, envInt, envBool, envList };
