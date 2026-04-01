/**
 * File: src/tests/helpers/http/authenticatedApiClient.js
 */
import request from "supertest";

export function createAuthenticatedApiClient(
  app,
  { tenantSlug = "base", cookie } = {},
) {
  function withDefaults(req) {
    req.set("X-Tenant-Slug", tenantSlug);
    if (cookie) req.set("Cookie", cookie);
    return req;
  }

  return {
    get: (url) => withDefaults(request(app).get(url)),
    post: (url) => withDefaults(request(app).post(url)),
    put: (url) => withDefaults(request(app).put(url)),
    patch: (url) => withDefaults(request(app).patch(url)),
    delete: (url) => withDefaults(request(app).delete(url)),
  };
}