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
