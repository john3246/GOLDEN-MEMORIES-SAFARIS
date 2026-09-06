/**
 * Why each dependency exists:
 * - express: mature lightweight HTTP framework for the API
 * - dotenv: load .env in local development only
 * - helmet: baseline HTTP security headers
 * - cors: explicit origin allowlists (never * for admin)
 * - express-rate-limit: configurable rate limits per surface
 * - shared-* packages: monorepo contracts without duplication
 *
 * PostgreSQL / Redis clients are intentionally deferred until Phase 2–3
 * when the database and cache layers are implemented.
 */
export {};
