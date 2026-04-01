/**
 * File: src/tests/helpers/http/apiClient.js
 */

import request from "supertest";

export function createApiClient(app, tenantSlug = "base") {
  return {
    get: (url) => request(app).get(url).set("X-Tenant-Slug", tenantSlug),
    post: (url) => request(app).post(url).set("X-Tenant-Slug", tenantSlug),
    put: (url) => request(app).put(url).set("X-Tenant-Slug", tenantSlug),
    patch: (url) => request(app).patch(url).set("X-Tenant-Slug", tenantSlug),
    delete: (url) => request(app).delete(url).set("X-Tenant-Slug", tenantSlug),
  };
}