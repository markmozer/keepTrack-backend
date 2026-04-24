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

describe("Logout (integration) POST /api/t/:tenantSlug/auth/logout", () => {
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

  function tenantLogoutEndpoint(slug) {
    return `/api/t/${slug}/auth/logout`;
  }

  function tenantMeEndpoint(slug) {
    return `/api/t/${slug}/auth/me`;
  }

  async function setupAuthenticatedApi() {
    const email = `user@${testTenant.slug}.nl`;
    const userRoles = [{ name: "ADMIN" }];

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

      const response = await api.post(tenantLogoutEndpoint(testTenant.slug));
      const payload = expectAppSuccessWithPayload(response, { status: 200 });

      expect(payload).toEqual({
        loggedOut: true,
      });
    });
  });

  describe("tenant resolution", () => {
    it("returns 404 resource-not-found when the tenant-like path segment does not resolve", async () => {
      const api = createApiClient(app, undefined);
      const response = await api.post("/api/t/auth/logout");

      expectAppError(response, 404, "RESOURCE_NOT_FOUND");
    });

    it("returns 404 when tenantSlug in path is empty", async () => {
      const api = createApiClient(app, "");
      const response = await api.post("/api/t//auth/logout");

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });
  });

  describe("idempotency", () => {
    it("returns 200 with loggedOut=true when principal is missing", async () => {
      const api = createApiClient(app, testTenant.slug);

      const response = await api.post(tenantLogoutEndpoint(testTenant.slug));
      const payload = expectAppSuccessWithPayload(response, { status: 200 });

      expect(payload).toEqual({
        loggedOut: true,
      });
    });

    it("returns 200 with loggedOut=true when called multiple times", async () => {
      const { api } = await setupAuthenticatedApi();

      const first = await api.post(tenantLogoutEndpoint(testTenant.slug));
      const second = await api.post(tenantLogoutEndpoint(testTenant.slug));

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
    it("destroys the session so /api/t/:tenantSlug/auth/me returns 401 after logout", async () => {
      const { cookie } = await setupAuthenticatedApi();

      const authenticatedApi = createAuthenticatedApiClient(app, {
        tenantSlug: testTenant.slug,
        cookie,
      });

      const meBeforeLogout = await authenticatedApi.get(tenantMeEndpoint(testTenant.slug));
      expect(meBeforeLogout.status).toBe(200);

      const logoutResponse = await authenticatedApi.post(tenantLogoutEndpoint(testTenant.slug));
      const logoutPayload = expectAppSuccessWithPayload(logoutResponse, {
        status: 200,
      });

      expect(logoutPayload).toEqual({
        loggedOut: true,
      });

      const meAfterLogout = await authenticatedApi.get(tenantMeEndpoint(testTenant.slug));
      expectAppError(meAfterLogout, 401, "UNAUTHORIZED");
    });
  });
});
