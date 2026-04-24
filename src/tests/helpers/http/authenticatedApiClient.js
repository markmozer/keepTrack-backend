/**
 * File: src/tests/helpers/http/authenticatedApiClient.js
 */
import request from "supertest";

/**
 * @param {import("express").Express} app
 * @param {{
 *   tenantSlug?: string,
 *   cookie?: string | string[],
 * }} [options]
 */
export function createAuthenticatedApiClient(
  app,
  { tenantSlug = "base", cookie } = {},
) {
  function resolveUrl(url) {
    if (tenantSlug === undefined || typeof url !== "string") {
      return url;
    }

    if (url.startsWith("/api/system")) {
      return url;
    }

    if (url.startsWith("/api/t/")) {
      return url;
    }

    if (url.startsWith("/api/auth/")) {
      return url.replace("/api/auth/", `/api/t/${tenantSlug}/auth/`);
    }

    if (url === "/api/users/accept-invite") {
      return `/api/t/${tenantSlug}/auth/accept-invite`;
    }

    if (url === "/api/users/forgot-password") {
      return `/api/t/${tenantSlug}/auth/forgot-password`;
    }

    if (url === "/api/users/request-pwd-reset") {
      return `/api/t/${tenantSlug}/auth/forgot-password`;
    }

    if (url === "/api/users/reset-password") {
      return `/api/t/${tenantSlug}/auth/reset-password`;
    }

    if (url.startsWith("/api/")) {
      return url.replace("/api/", `/api/t/${tenantSlug}/`);
    }

    return url;
  }

  function withDefaults(method, url) {
    const req = request(app)[method](resolveUrl(url));

    if (cookie) {
      req.set("Cookie", cookie);
    }

    return req;
  }

  return {
    get: (url) => withDefaults("get", url),
    post: (url) => withDefaults("post", url),
    put: (url) => withDefaults("put", url),
    patch: (url) => withDefaults("patch", url),
    delete: (url) => withDefaults("delete", url),
  };
}
