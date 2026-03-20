/**
 * File: src/interface/http/utils/resolveTenantSlug.js
 */


/**
 * @param {import("express").Request} req
 * @returns {string|null}
 */
export function resolveTenantSlug(req) {
  const env = process.env.NODE_ENV;
  const defaultTenantSlug = process.env.DEFAULT_TENANT_SLUG;

  // Local development fallback
  if ((env === "dev" || env === "test") && defaultTenantSlug) {
    return defaultTenantSlug.trim().toLowerCase();
  }

  const hostHeader = req.headers.host;

  if (!hostHeader || typeof hostHeader !== "string") {
    return null;
  }

  // Remove port if present, e.g. "mozer-consulting.localhost:3000"
  const host = hostHeader.split(":")[0].toLowerCase();

  // Examples:
  // - mozer-consulting.keeptrack.com  -> mozer-consulting
  // - mozer-consulting.localhost      -> mozer-consulting
  // - localhost                       -> no tenant slug
  const parts = host.split(".");

  if (parts.length < 2) {
    return null;
  }

  const subdomain = parts[0];

  if (!subdomain || subdomain === "www") {
    return null;
  }

  return subdomain;
}
