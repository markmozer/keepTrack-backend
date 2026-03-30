/**
 * File: keepTrack-backend/src/interface/http/middleware/cors.middleware.js
 */
import cors from "cors";

/**
 * @typedef {import("../../../app/config/appConfig.js").AppConfig} AppConfig
 */

/**
 * @param {string | undefined} origin
 * @param {AppConfig} appConfig
 */
function isAllowedOrigin(origin, appConfig) {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    const { baseDomain } = appConfig.frontend;

    if (url.hostname === baseDomain) return true;

    if (url.hostname.endsWith(`.${baseDomain}`)) return true;

    return false;
  } catch {
    return false;
  }
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

        // --- DEV ---
        if (appConfig.runtime.isDevelopment) {
          if (
            url.hostname === "localhost" ||
            url.hostname.endsWith(".localhost")
          ) {
            return callback(null, true);
          }
        }

        // --- PROD ---
        const { baseDomain } = appConfig.frontend;

        if (
          url.hostname === baseDomain ||
          url.hostname.endsWith(`.${baseDomain}`)
        ) {
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
