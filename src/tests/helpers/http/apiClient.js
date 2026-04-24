/**
 * File: src/tests/helpers/http/apiClient.js
 */

import request from "supertest";

export function createApiClient(app, tenantSlug) {
  const client = request(app);

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

    return url;
  }

  function withTenant(method, url) {
    return client[method](resolveUrl(url));
  }

  return {
    get: (url) => withTenant("get", url),
    post: (url) => withTenant("post", url),
    put: (url) => withTenant("put", url),
    patch: (url) => withTenant("patch", url),
    delete: (url) => withTenant("delete", url),
  };
}
