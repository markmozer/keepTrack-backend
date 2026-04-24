/**
 * File: src/tests/integration/auth/authenticateUser.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { seedUser } from "../../helpers/seed/seedUser.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";

describe("AuthenticateUser (integration) POST /api/t/:tenantSlug/auth/login", () => {
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

  function tenantEndpoint(slug) {
    return `/api/t/${slug}/auth/login`;
  }

  describe("success path", () => {
    it("authenticates an active user, returns 200, and sets session cookie", async () => {
      const userRoles = [{ name: "ADMIN" }];
      const password = "Strong123!123";

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: password,
      });

      const api = createApiClient(app, testTenant.slug);

      const response = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
        password,
      });

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      const roleNames = userRoles.map((ur) => ur.name);

      expect(payload).toEqual({
        user: {
          userId: user.id,
          tenantId: testTenant.id,
          status: UserStatus.ACTIVE,
          roleNames,
        },
      });

      const cookies = response.headers["set-cookie"] || [];
      expect(cookies.length).toBeGreaterThan(0);
      expect(
        cookies.some((cookie) =>
          cookie.startsWith(`${container.appConfig.cookie.name}=`),
        ),
      ).toBe(true);
    });
  });

  describe("tenant resolution", () => {
    it("returns 404 resource-not-found when the tenant-like path segment does not resolve", async () => {
      const userRoles = [{ name: "ADMIN" }];
      const password = "Strong123!123";

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: password,
      });

      const api = createApiClient(app, undefined);

      const response = await api.post("/api/t/auth/login").send({
        email: user.email,
        password,
      });

      expectAppError(response, 404, "RESOURCE_NOT_FOUND");
    });

    it("returns 404 when tenantSlug in path is empty", async () => {
      const userRoles = [{ name: "ADMIN" }];
      const password = "Strong123!123";

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: password,
      });

      const api = createApiClient(app, "");

      const response = await api.post("/api/t//auth/login").send({
        email: user.email,
        password,
      });

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });
  });

  describe("validation", () => {
    it("returns 422 when email is missing", async () => {
      const userRoles = [{ name: "ADMIN" }];
      const password = "Strong123!123";

      await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: password,
      });

      const api = createApiClient(app, testTenant.slug);

      const response1 = await api.post(tenantEndpoint(testTenant.slug)).send({
        password,
      });

      expectAppError(response1, 422, "VALIDATION_ERROR");

      const response2 = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: null,
        password,
      });

      expectAppError(response2, 422, "VALIDATION_ERROR");

      const response3 = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: "",
        password,
      });

      expectAppError(response3, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when password is missing", async () => {
      const userRoles = [{ name: "ADMIN" }];
      const password = "Strong123!123";

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: password,
      });

      const api = createApiClient(app, testTenant.slug);

      const response1 = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
      });

      expectAppError(response1, 422, "VALIDATION_ERROR");

      const response2 = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
        password: null,
      });

      expectAppError(response2, 422, "VALIDATION_ERROR");

      const response3 = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
        password: "",
      });

      expectAppError(response3, 422, "VALIDATION_ERROR");
    });
  });

  describe("authentication failures", () => {
    it("returns 401 when unknown email in tenant", async () => {
      const otherTenant = await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Other Tenant",
          slug: "other-tenant",
          type: "CLIENT",
        },
      });

      const userRoles = [{ name: "ADMIN" }];
      const password = "Strong123!123";

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        tenant: otherTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: password,
      });

      const api = createApiClient(app, testTenant.slug);

      const response = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
        password,
      });

      expectAppError(response, 401, "INVALID_CREDENTIALS");
    });

    it("returns 401 when user has no password", async () => {
      const userRoles = [{ name: "ADMIN" }];

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: null,
      });

      const api = createApiClient(app, testTenant.slug);

      const response = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
        password: "Strong123!123",
      });

      expectAppError(response, 401, "INVALID_CREDENTIALS");
    });

    it("returns 401 when password is invalid", async () => {
      const userRoles = [{ name: "ADMIN" }];
      const password = "CorrectPassword123!";

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: password,
      });

      const api = createApiClient(app, testTenant.slug);

      const response = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
        password: "WrongPassword123!",
      });

      expectAppError(response, 401, "INVALID_CREDENTIALS");
    });

    it("returns 401 when user status is not ACTIVE", async () => {
      const userRoles = [{ name: "ADMIN" }];
      const password = "Strong123!123";

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.INVITED,
        passwordPlain: password,
      });

      const api = createApiClient(app, testTenant.slug);

      const response = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
        password,
      });

      expectAppError(response, 401, "INVALID_CREDENTIALS");
    });
  });

  describe("role requirements", () => {
    it("returns 403 when user has no valid roles", async () => {
      const userRoles = [
        {
          name: "ADMIN",
          validFrom: new Date(1900, 1, 1),
          validTo: new Date(1900, 1, 2),
        },
      ];
      const password = "Strong123!123";

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: testTenant,
        userRoles,
        status: UserStatus.ACTIVE,
        passwordPlain: password,
      });

      const api = createApiClient(app, testTenant.slug);

      const response = await api.post(tenantEndpoint(testTenant.slug)).send({
        email: user.email,
        password,
      });

      expectAppError(response, 403, "NO_VALID_ROLES");
    });
  });
});
