/**
 * File: src/tests/integration/tenants/getById.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js"
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectTenantAdminDto } from "../../helpers/assertions/expectTenantAdminDto.js";
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
      userRoles: [{name: "SUPER_ADMIN"}],
    });
  }

  async function setupAdmin(tenant) {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant,
      email: "admin@example.com",
      userRoles: [{name: "ADMIN"}],
    });
  }

  describe("authorization", () => {
    it("returns 200 when user has SUPER_ADMIN role and reads any tenant", async () => {
      const { api } = await setupSuperAdmin(baseTenant);

      const response_own = await api.get(`/api/tenants/${baseTenant.id}`);

      const payload_own = expectAppSuccessWithPayload(response_own, {status: 200});
      expectTenantAdminDto(payload_own, {
        id: baseTenant.id,
        name: baseTenant.name,
        slug: baseTenant.slug,
        status: baseTenant.status,
        type: baseTenant.type,
      });

      const response_other = await api.get(`/api/tenants/${clientTenant.id}`);

      const payload_other = expectAppSuccessWithPayload(response_other, {status: 200});
      expectTenantAdminDto(payload_other, {
        id: clientTenant.id,
        name: clientTenant.name,
        slug: clientTenant.slug,
        status: clientTenant.status,
        type: clientTenant.type,
      });
    });
    it("returns 200 when non-SUPER_ADMIN user reads own tenant", async () => {
      const { api } = await setupAdmin(clientTenant);

      const response = await api.get(`/api/tenants/${clientTenant.id}`);

      const payload = expectAppSuccessWithPayload(response, {status: 200});
      expectTenantAdminDto(payload, {
        id: clientTenant.id,
        name: clientTenant.name,
        slug: clientTenant.slug,
        status: clientTenant.status,
        type: clientTenant.type,
      });
    });

    it("returns 403 when non-SUPER_ADMIN user reads another tenant", async () => {
      const { api } = await setupAdmin(clientTenant);

      const response = await api.get(`/api/tenants/${baseTenant.id}`);

      expectAppError(response, 403, "FORBIDDEN");
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, baseTenant.slug);

      const response = await api.get(`/api/tenants/${clientTenant.id}`);

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("not found", () => {
    it("returns 404 when tenantId does not exist", async () => {
      const { api } = await setupSuperAdmin(baseTenant);

      const response = await api.get(`/api/tenants/${randomUUID()}`);

      expectAppError(response, 404, "RESOURCE_NOT_FOUND");
    });
  });

  describe("validation", () => {
    it("returns 422 when tenantId is not a valid UUID", async () => {
      const { api } = await setupSuperAdmin(baseTenant);

      const response = await api.get(`/api/tenants/abcd`);

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });
});
