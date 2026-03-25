/**
 * File: keepTrack-backend/src/shared/config/appConfig.js
 */

import { getEnv, requireEnv } from "./env.js";

/**
 * @typedef {"development" | "test" | "production"} NodeEnv
 * @typedef {"subdomain" | "path"} TenantMode
 * @typedef {"lax" | "strict" | "none"} SameSite
 */

/**
 * @typedef {Object} RuntimeConfig
 * @property {NodeEnv} nodeEnv
 * @property {boolean} isDevelopment
 * @property {boolean} isTest
 * @property {boolean} isProduction
 */

/**
 * @typedef {Object} FrontendConfig
 * @property {TenantMode} tenantMode
 * @property {string} protocol
 * @property {string} baseDomain
 */

/**
 * @typedef {Object} CookieConfig
 * @property {string} name
 * @property {boolean} httpOnly
 * @property {boolean} secure
 * @property {SameSite} sameSite
 * @property {string} path
 */

/**
 * @typedef {Object} SessionConfig
 * @property {string} redisUrl
 * @property {number} ttlSeconds
 * @property {string} keyPrefix
 */

/**
 * @typedef {"mock" | "msgraph"} EmailProvider
 */

/**
 * @typedef {Object} EmailConfig
 * @property {EmailProvider} provider
 * @property {MsGraphEmailConfig | null} msgraph
 */

/**
 * @typedef {Object} MsGraphEmailConfig
 * @property {string} tenantId
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} userPrincipalName
 */

/**
 * @typedef {Object} DatabaseConfig
 * @property {string} url
 */

/**
 * @typedef {Object} AuthConfig
 * @property {number} inviteTtlDays
 */

/**
 * @typedef {Object} AppConfig
 * @property {RuntimeConfig} runtime
 * @property {DatabaseConfig} database
 * @property {FrontendConfig} frontend
 * @property {CookieConfig} cookie
 * @property {SessionConfig} session
 * @property {EmailConfig} email
 * @property {AuthConfig} auth
 */

/**
 * @param {string} value
 * @returns {NodeEnv}
 */
function parseNodeEnv(value) {
  if (value === "test" || value === "production") {
    return value;
  }
  return "development";
}

/**
 * @param {string} value
 * @returns {TenantMode}
 */
function parseTenantMode(value) {
  if (value !== "subdomain" && value !== "path") {
    throw new Error(
      `Invalid APP_TENANT_MODE: "${value}". Expected "subdomain" or "path".`,
    );
  }
  return value;
}

/**
 * @param {string} value
 * @returns {SameSite}
 */
function parseSameSite(value) {
  if (value === "strict" || value === "none") {
    return value;
  }
  return "lax";
}

/**
 * @param {string} value
 * @returns {EmailProvider}
 */
function parseEmailProvider(value) {
  if (value !== "mock" && value !== "msgraph") {
    throw new Error(
      `Invalid EMAIL_PROVIDER: "${value}". Expected "mock" or "msgraph".`,
    );
  }
  return value;
}

/**
 * @param {string} name
 * @param {string} value
 * @returns {number}
 */
function parsePositiveInt(name, value) {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return num;
}

/**
 * @returns {AppConfig}
 */
export function loadAppConfig() {
  const nodeEnv = parseNodeEnv(getEnv("NODE_ENV", "development"));

  const tenantMode = parseTenantMode(requireEnv("APP_TENANT_MODE"));
  const protocol = requireEnv("APP_PROTOCOL");
  const baseDomain = requireEnv("APP_BASE_DOMAIN").replace(/\/+$/, "");

  const emailProvider = parseEmailProvider(getEnv("EMAIL_PROVIDER", "mock"));

  /** @type {MsGraphEmailConfig | null} */
  let msgraph = null;

  if (emailProvider === "msgraph") {
    msgraph = {
      tenantId: requireEnv("MSAL_TENANT_ID"),
      clientId: requireEnv("MSAL_CLIENT_ID"),
      clientSecret: requireEnv("MSAL_CLIENT_SECRET"),
      userPrincipalName: requireEnv("USER_PRINCIPAL_NAME"),
    };
  }

  return {
    runtime: {
      nodeEnv,
      isDevelopment: nodeEnv === "development",
      isTest: nodeEnv === "test",
      isProduction: nodeEnv === "production",
    },
    database: {
      url: requireEnv("DATABASE_URL"),
    },
    frontend: {
      tenantMode,
      protocol,
      baseDomain,
    },
    cookie: {
      name: getEnv("SESSION_COOKIE_NAME", "sid"),
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: parseSameSite(getEnv("SESSION_COOKIE_SAME_SITE", "lax")),
      path: "/",
    },
    session: {
      redisUrl: requireEnv("REDIS_URL"),
      ttlSeconds: parsePositiveInt(
        "SESSION_TTL_SECONDS",
        getEnv("SESSION_TTL_SECONDS", "86400"),
      ),
      keyPrefix: getEnv("SESSION_KEY_PREFIX", "sess:"),
    },
    email: {
      provider: emailProvider,
      msgraph,
    },
    auth: {
      inviteTtlDays: 14,
    }
  };
}
