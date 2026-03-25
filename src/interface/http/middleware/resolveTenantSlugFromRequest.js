/**
 * File: keepTrack-backend/src/interface/http/middleware/resolveTenantSlugFromRequest.js
 */

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("../../../shared/config/appConfig.js").AppConfig} AppConfig
 */

/**
 * @param {string} value
 * @returns {string}
 */
function stripPort(value) {
  return value.split(":")[0];
}

/**
 * @param {string | undefined} value
 * @returns {string | null}
 */
function tryGetHostnameFromUrl(value) {
  if (!value) return null;

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

/**
 * @param {string} hostname
 * @param {string} suffix
 * @returns {string | null}
 */
function extractSlugBeforeSuffix(hostname, suffix) {
  if (!hostname.endsWith(suffix)) return null;

  const remainder = hostname.slice(0, -suffix.length);

  if (!remainder) return null;

  const parts = remainder.split(".").filter(Boolean);

  if (parts.length !== 1) {
    return null;
  }

  return parts[0] || null;
}

/**
 * @param {Request} req
 * @param {AppConfig} appConfig
 * @returns {string | null}
 */
export function resolveTenantSlugFromRequest(req, appConfig) {
  const originHostname = tryGetHostnameFromUrl(
    typeof req.headers.origin === "string" ? req.headers.origin : undefined
  );

  const hostHeader =
    typeof req.headers.host === "string" ? req.headers.host : undefined;
  const hostHostname = hostHeader ? stripPort(hostHeader) : null;

  // Prefer origin in dev because backend may run on plain localhost:3000
  const candidateHostnames = appConfig.runtime.isDevelopment
    ? [originHostname, hostHostname].filter(Boolean)
    : [hostHostname, originHostname].filter(Boolean);

  for (const hostname of candidateHostnames) {
    if (!hostname) continue;

    if (appConfig.runtime.isDevelopment) {
      if (hostname.endsWith(".localhost")) {
        const slug = extractSlugBeforeSuffix(hostname, ".localhost");
        if (slug) return slug;
      }
    }

    const prodSuffix = `.${appConfig.frontend.baseDomain}`;
    if (hostname.endsWith(prodSuffix)) {
      const slug = extractSlugBeforeSuffix(hostname, prodSuffix);
      if (slug) return slug;
    }
  }

  return null;
}