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
    const userRoles = [{name: "ADMIN"}];

    const { user, cookie, api } = await setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: testTenant,
      email,
      password: "Strong123!123",
      userRoles,
    });

    return { user, cookie, api };
  }

  describe("success path", () => {
    it("returns 200 with loggedOut=true when authenticated user logs out", async () => {
      const { api } = await setupAuthenticatedApi();

      const response = await api.post(`/api/t/${testTenant.slug}/auth/logout`);

      const payload = expectAppSuccessWithPayload(response, { status: 200 });

      expect(payload).toEqual({
        loggedOut: true,
      });
    });
  });

  describe("tenant resolution", () => {
    it("returns 404 when tenantSlug in path is missing", async () => {
      const api = createApiClient(app, undefined);

      const response = await api.post("/api/auth/logout");

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });

    it("returns 404 when tenantSlug in path is empty", async () => {
      const api = createApiClient(app, "");

      const response = await api.post("/api/auth/logout");

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });
  });

  describe("idempotency", () => {
    it("returns 200 with loggedOut=true when principal is missing", async () => {
      const api = createApiClient(app, testTenant.slug);

      const response = await api.post(`/api/t/${testTenant.slug}/auth/logout`);

      const payload = expectAppSuccessWithPayload(response, { status: 200 });

      expect(payload).toEqual({
        loggedOut: true,
      });
    });

    it("returns 200 with loggedOut=true when called multiple times", async () => {
      const { api } = await setupAuthenticatedApi();

      const first = await api.post(`/api/t/${testTenant.slug}/auth/logout`);
      const second = await api.post(`/api/t/${testTenant.slug}/auth/logout`);

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

      const meBeforeLogout = await authenticatedApi.get(`/api/t/${testTenant.slug}/auth/me`);
      expect(meBeforeLogout.status).toBe(200);

      const logoutResponse = await authenticatedApi.post(`/api/t/${testTenant.slug}/auth/logout`);
      const logoutPayload = expectAppSuccessWithPayload(logoutResponse, {
        status: 200,
      });

      expect(logoutPayload).toEqual({
        loggedOut: true,
      });

      const meAfterLogout = await authenticatedApi.get(`/api/t/${testTenant.slug}/auth/me`);
      expectAppError(meAfterLogout, 401, "UNAUTHORIZED");
    });
  });
});