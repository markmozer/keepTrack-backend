/**
 * File: src/tests/integration/auth/me.int.test.js
 */

import { describe, it, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { createAuthenticatedApiClient } from "../../helpers/http/authenticatedApiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectAuthMePayload } from "../../helpers/assertions/expectAuthMePayload.js";

describe("GetAuthMe (integration) GET /api/auth/me", () => {
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

  describe("success path", () => {
    it("returns 200 with principal for authenticated user", async () => {
      const email = `user@${testTenant.slug}.nl`;
      const roleNames = ["ADMIN"];

      const { user, api } = await setupAuthenticatedPrincipal({
        app,
        prisma: container.prisma,
        container,
        tenant: testTenant,
        email,
        password: "Strong123!123",
        roleNames,
      });

      const response = await api.get("/api/auth/me");

      const payload = expectAppSuccessWithPayload(response, { status: 200 });

      expectAuthMePayload(payload, {
        userId: user.id,
        tenantId: testTenant.id,
        roleNames,
      });
    });
  });

  describe("tenant resolution", () => {
    it("returns 400 when X-Tenant-Slug header is missing", async () => {
      const api = createApiClient(app, undefined);

      const response = await api.get("/api/auth/me");

      expectAppError(response, 400, "BAD_REQUEST");
    });

    it("returns 400 when X-Tenant-Slug header is empty", async () => {
      const api = createApiClient(app, "");

      const response = await api.get("/api/auth/me");

      expectAppError(response, 400, "BAD_REQUEST");
    });
  });

  describe("authentication", () => {
    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, testTenant.slug);

      const response = await api.get("/api/auth/me");

      expectAppError(response, 401, "UNAUTHORIZED");
    });
    it("returns 401 when tenant-slug does not match principal", async () => {
      const email = `user@${testTenant.slug}.nl`;
      const roleNames = ["ADMIN"];

      const { cookie } = await setupAuthenticatedPrincipal({
        app,
        prisma: container.prisma,
        container,
        tenant: testTenant,
        email,
        password: "Strong123!123",
        roleNames,
      });

      await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Other Tenant",
          slug: "other-tenant",
          type: "CLIENT",
        },
      });

      const otherApi = createAuthenticatedApiClient(app, {
        tenantSlug: "other-tenant",
        cookie,
      });

      const response = await otherApi.get("/api/auth/me");

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });
});
