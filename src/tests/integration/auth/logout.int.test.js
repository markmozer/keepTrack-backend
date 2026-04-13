/**
 * File: src/tests/integration/auth/logout.int.test.js
 */


import { describe, it, beforeEach, beforeAll, afterAll, expect } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { createAuthenticatedApiClient } from "../../helpers/http/authenticatedApiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";

describe("Logout (integration) POST /api/auth/logout", () => {
  let container;
  let app;
  let testTenant;

  beforeAll(async () => {
    ({ app, container } = await createTestApp());
  });

  beforeEach(async () => {
    await resetDatabase({ prisma: container.prisma });

    testTenant = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Test Tenant",
        slug: "test-tenant",
        type: "CLIENT",
      },
    });
  });

  afterAll(async () => {
    if (container) {
      await container.shutdown();
    }
  });

  async function setupAuthenticatedApi() {
    const email = `user@${testTenant.slug}.nl`;
    const roleNames = ["ADMIN"];

    const { user, cookie, api } = await setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: testTenant,
      email,
      password: "Strong123!123",
      roleNames,
    });

    return { user, cookie, api };
  }

  describe("success path", () => {
    it("returns 200 with loggedOut=true when authenticated user logs out", async () => {
      const { api } = await setupAuthenticatedApi();

      const response = await api.post("/api/auth/logout");

      const payload = expectAppSuccessWithPayload(response, { status: 200 });

      expect(payload).toEqual({
        loggedOut: true,
      });
    });
  });

  describe("tenant resolution", () => {
    it("returns 400 when X-Tenant-Slug header is missing", async () => {
      const api = createApiClient(app, undefined);

      const response = await api.post("/api/auth/logout");

      expectAppError(response, 400, "BAD_REQUEST");
    });

    it("returns 400 when X-Tenant-Slug header is empty", async () => {
      const api = createApiClient(app, "");

      const response = await api.post("/api/auth/logout");

      expectAppError(response, 400, "BAD_REQUEST");
    });
  });

  describe("idempotency", () => {
    it("returns 200 with loggedOut=true when principal is missing", async () => {
      const api = createApiClient(app, testTenant.slug);

      const response = await api.post("/api/auth/logout");

      const payload = expectAppSuccessWithPayload(response, { status: 200 });

      expect(payload).toEqual({
        loggedOut: true,
      });
    });

    it("returns 200 with loggedOut=true when called multiple times", async () => {
      const { api } = await setupAuthenticatedApi();

      const first = await api.post("/api/auth/logout");
      const second = await api.post("/api/auth/logout");

      const firstPayload = expectAppSuccessWithPayload(first, { status: 200 });
      const secondPayload = expectAppSuccessWithPayload(second, { status: 200 });

      expect(firstPayload).toEqual({
        loggedOut: true,
      });

      expect(secondPayload).toEqual({
        loggedOut: true,
      });
    });
  });

  describe("session invalidation", () => {
    it("destroys the session so /api/auth/me returns 401 after logout", async () => {
      const { cookie } = await setupAuthenticatedApi();

      const authenticatedApi = createAuthenticatedApiClient(app, {
        tenantSlug: testTenant.slug,
        cookie,
      });

      const meBeforeLogout = await authenticatedApi.get("/api/auth/me");
      expect(meBeforeLogout.status).toBe(200);

      const logoutResponse = await authenticatedApi.post("/api/auth/logout");
      const logoutPayload = expectAppSuccessWithPayload(logoutResponse, {
        status: 200,
      });

      expect(logoutPayload).toEqual({
        loggedOut: true,
      });

      const meAfterLogout = await authenticatedApi.get("/api/auth/me");
      expectAppError(meAfterLogout, 401, "UNAUTHORIZED");
    });
  });
});