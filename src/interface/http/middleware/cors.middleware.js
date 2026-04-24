/**
 * File: keepTrack-backend/src/interface/http/middleware/cors.middleware.js
 */
import cors from "cors";

/**
 * @typedef {import("../../../app/config/appConfig.js").AppConfig} AppConfig
 */

/**
 * @param {URL} url
 * @returns {boolean}
 */
function isDevelopmentLocalhostOrigin(url) {
  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".localhost")
  );
}

/**
 * @param {URL} url
 * @param {AppConfig} appConfig
 * @returns {boolean}
 */
function isAllowedByBaseDomain(url, appConfig) {
  const { baseDomain } = appConfig.frontend;

  if (!baseDomain) {
    return false;
  }

  return (
    url.hostname === baseDomain || url.hostname.endsWith(`.${baseDomain}`)
  );
}

/**
 * @param {URL} url
 * @param {AppConfig} appConfig
 * @returns {boolean}
 */
function isAllowedByConfiguredOrigins(url, appConfig) {
  const allowedOrigins = appConfig.frontend.allowedOrigins ?? [];

  if (allowedOrigins.length === 0) {
    return false;
  }

  return allowedOrigins.includes(url.origin);
}

/**
 * @param {AppConfig} appConfig
 */
export function createCorsMiddleware(appConfig) {
  return cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      try {
        const url = new URL(origin);

        if (appConfig.runtime.isDevelopment && isDevelopmentLocalhostOrigin(url)) {
          return callback(null, true);
        }

        if (isAllowedByConfiguredOrigins(url, appConfig)) {
          return callback(null, true);
        }

        if (isAllowedByBaseDomain(url, appConfig)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      } catch {
        return callback(new Error("Invalid origin"));
      }
    },
    credentials: true,
  });
}
