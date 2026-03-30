/**
 * File: src/tests/helpers/http/apiClient.js
 */
import request from "supertest";

/**
 * @param {import("express").Express} app
 * @param {string} [tenantSlug="base"]
 */
export function createApiClient(app, tenantSlug = "base") {
  return {
    /**
     * @param {string} url
     */
    get(url) {
      return request(app).get(url).set("X-Tenant-Slug", tenantSlug);
    },

    /**
     * @param {string} url
     */
    post(url) {
      return request(app).post(url).set("X-Tenant-Slug", tenantSlug);
    },

    /**
     * @param {string} url
     */
    put(url) {
      return request(app).put(url).set("X-Tenant-Slug", tenantSlug);
    },

    /**
     * @param {string} url
     */
    patch(url) {
      return request(app).patch(url).set("X-Tenant-Slug", tenantSlug);
    },

    /**
     * @param {string} url
     */
    delete(url) {
      return request(app).delete(url).set("X-Tenant-Slug", tenantSlug);
    },
  };
}