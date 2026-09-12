/**
 * Why each dependency exists:
 * - express: mature lightweight HTTP framework for the API
 * - dotenv: load .env in local development only
 * - helmet: baseline HTTP security headers
 * - cors: explicit origin allowlists (never * for admin)
 * - express-rate-limit: configurable rate limits per surface
 * - shared-* packages: monorepo contracts without duplication
 *
 * - jsonwebtoken: CMS admin sessions (HS256)
 * - bcryptjs: password hashing without native addons
 * - multer: Safari media uploads to disk (not the database)
 */
export {};
