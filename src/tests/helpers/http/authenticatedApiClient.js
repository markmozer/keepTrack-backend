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
  function applyDefaults(req) {
    req.set("X-Tenant-Slug", tenantSlug);

    if (cookie) {
      req.set("Cookie", cookie);
    }

    return req;
  }

  return {
    get(url) {
      return applyDefaults(request(app).get(url));
    },

    post(url) {
      return applyDefaults(request(app).post(url));
    },

    put(url) {
      return applyDefaults(request(app).put(url));
    },

    patch(url) {
      return applyDefaults(request(app).patch(url));
    },

    delete(url) {
      return applyDefaults(request(app).delete(url));
    },
  };
}