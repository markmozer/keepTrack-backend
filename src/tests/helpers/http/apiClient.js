/**
 * File: src/tests/helpers/http/apiClient.js
 */

import request from "supertest";

export function createApiClient(app, tenantSlug) {
  const client = request(app);

  function withTenant(req) {
    if (tenantSlug !== undefined) {
      req.set("X-Tenant-Slug", tenantSlug);
    }
    return req;
  }

  return {
    get: (url) => withTenant(client.get(url)),
    post: (url) => withTenant(client.post(url)),
    put: (url) => withTenant(client.put(url)),
    patch: (url) => withTenant(client.patch(url)),
    delete: (url) => withTenant(client.delete(url)),
  };
}