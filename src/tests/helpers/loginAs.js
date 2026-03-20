/**
 * File: src/tests/helpers/loginAs.js
 */

import request from "supertest";

/**
 * @typedef {Object} LoginAsInput
 * @property {import("express").Express} app
 * @property {string} tenantSlug
 * @property {string} email
 * @property {string} [password]
 */

/**
 * Logs in through the real auth endpoint and returns a supertest agent
 * that keeps the authenticated session/cookies.
 *
 * @param {import("express").Express} app
 * @param {{ tenantSlug: string, email: string, password?: string }} input
 */
export async function loginAs(
  app,
  { tenantSlug, email, password = "Test123!123" }
) {
  const agent = request.agent(app);

  const res = await agent
    .post("/api/auth/login")
    .send({
      email,
      password,
    });

  if (res.status !== 200) {
    throw new Error(
      `loginAs failed for ${email}. Expected 200, got ${res.status}. Response: ${JSON.stringify(res.body)}`
    );
  }

  return agent;
}