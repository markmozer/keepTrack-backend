/**
 * File: src/interface/http/utils/resolveTenantSlug.js
 */

/**
 * @param {import("express").Request} req
 * @returns {string | null}
 */
export function resolveTenantSlug(req) {
  const hostHeader = req.headers.host;

  if (!hostHeader || typeof hostHeader !== "string") {
    return null;
  }

  // Remove port if present, e.g. "mozer-consulting.localhost:3000"
  const host = hostHeader.split(":")[0].trim().toLowerCase();

  // Examples:
  // - mozer-consulting.keeptrack.com  -> mozer-consulting
  // - mozer-consulting.localhost      -> mozer-consulting
  // - localhost                       -> no tenant slug

  if (!host) {
    return null;
  }

  // No tenant slug on plain localhost
  if (host === "localhost") {
    return null;
  }

  const parts = host.split(".");

  // Need at least "<slug>.<domain>"
  if (parts.length < 2) {
    return null;
  }

  const subdomain = parts[0];

  if (!subdomain || subdomain === "www") {
    return null;
  }

  return subdomain;
}