/**
 * File: src/tests/integration/tenants/getById.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { randomUUID } from "node:crypto";

describe("GetTenantById (integration) GET /api/tenants/:tenantId", () => {
  let container;
  let app;
  let baseTenant;
  let clientTenant;

  beforeAll(async () => {
    ({ app, container } = await createTestApp());
  });

  beforeEach(async () => {
    await resetDatabase({ prisma: container.prisma });

    baseTenant = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Base Tenant",
        slug: "base",
        type: "BASE",
      },
    });

    clientTenant = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "client 1",
        type: "CLIENT",
      },
    });
  });

  afterAll(async () => {
    if (container) {
      await container.shutdown();
    }
  });

  async function setupSuperAdmin(tenant) {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant,
      email: "super_admin@example.com",
      roleNames: ["SUPER_ADMIN"],
    });
  }

  async function setupAdmin(tenant) {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant,
      email: "admin@example.com",
      roleNames: ["ADMIN"],
    });
  }

  function expectValidDate(value) {
    expect(typeof value).toBe("string");
    expect(new Date(value).toString()).not.toBe("Invalid Date");
  }

  describe("authorization", () => {
    it("returns 200 when user has SUPER_ADMIN role and reads any tenant", async () => {
      const { api } = await setupSuperAdmin(baseTenant);

      const response_own = await api.get(`/api/tenants/${baseTenant.id}`);

      expect(response_own.status).toBe(200);
      expect(response_own.body).toEqual({
        success: true,
        payload: {
          id: baseTenant.id,
          name: baseTenant.name,
          slug: baseTenant.slug,
          status: baseTenant.status,
          type: baseTenant.type,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        error: null,
      });

      expectValidDate(response_own.body.payload.createdAt);
      expectValidDate(response_own.body.payload.updatedAt);

      const response_other = await api.get(`/api/tenants/${clientTenant.id}`);

      expect(response_other.status).toBe(200);
      expect(response_other.body).toEqual({
        success: true,
        payload: {
          id: clientTenant.id,
          name: clientTenant.name,
          slug: clientTenant.slug,
          status: clientTenant.status,
          type: clientTenant.type,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        error: null,
      });
      expectValidDate(response_other.body.payload.createdAt);
      expectValidDate(response_other.body.payload.updatedAt);
    });
    it("returns 200 when non-SUPER_ADMIN user reads own tenant", async () => {
      const { api } = await setupAdmin(clientTenant);

      const response = await api.get(`/api/tenants/${clientTenant.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        payload: {
          id: clientTenant.id,
          name: clientTenant.name,
          slug: clientTenant.slug,
          status: clientTenant.status,
          type: clientTenant.type,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        error: null,
      });
      expectValidDate(response.body.payload.createdAt);
      expectValidDate(response.body.payload.updatedAt);
    });

    it("returns 403 when non-SUPER_ADMIN user reads another tenant", async () => {
      const { api } = await setupAdmin(clientTenant);

      const response = await api.get(`/api/tenants/${baseTenant.id}`);

      expectAppError(response, 403);
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, baseTenant.slug);

      const response = await api.get(`/api/tenants/${clientTenant.id}`);

      expectAppError(response, 401);
    });
  });

  describe("not found", () => {
    it("returns 404 when tenantId does not exist", async () => {
      const { api } = await setupSuperAdmin(baseTenant);

      const response = await api.get(`/api/tenants/${randomUUID()}`);

      expectAppError(response, 404);
    });
  });

  describe("validation", () => {
    it("returns 422 when tenantId is not a valid UUID", async () => {
      const { api } = await setupSuperAdmin(baseTenant);

      const response = await api.get(`/api/tenants/abcd`);

      expectAppError(response, 422);
    });
  });
});
