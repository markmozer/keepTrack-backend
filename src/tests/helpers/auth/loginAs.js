/**
 * File: src/tests/helpers/auth/loginAs.js
 */


import request from "supertest";

/**
 * @param {Object} params
 * @param {import("express").Express} params.app
 * @param {string} params.tenantSlug
 * @param {string} params.email
 * @param {string} params.password
 */
export async function loginAs({ app, tenantSlug, email, password }) {
  const response = await request(app)
    .post("/api/auth/login")
    .set("X-Tenant-Slug", tenantSlug)
    .send({ email, password });

  return {
    response,
    cookie: response.headers["set-cookie"] || [],
  };
}