/**
 * File: src/tests/integration/roles/createRole.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectRoleDto } from "../../helpers/assertions/expectRoleDto.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";

describe("CreateRole (integration) POST /api/roles", () => {
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
        slug: "base-tenant",
        type: "BASE",
      },
    });

    clientTenant = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Client Tenant",
        slug: "client-tenant",
        type: "CLIENT",
      },
    });
  });

  afterAll(async () => {
    if (container) {
      await container.shutdown();
    }
  });

  describe("authorization", () => {
    it("returns 201 when principal has SUPER_ADMIN role", async () => {
      const email = `user@${baseTenant.slug}.nl`;
      const { api } = await setupAuthenticatedPrincipal({
        app,
        prisma: container.prisma,
        container,
        tenant: baseTenant,
        email,
        userRoles: [{name: "SUPER_ADMIN"}],
      });

      const name = "NEW_ROLE";

      const response = await api.post(`/api/t/${baseTenant.slug}/roles`).send({
        name,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 201,
      });
      expectRoleDto(payload, {
        tenantId: baseTenant.id,
        name,
      });

      const row = await container.prisma.role.findUnique({
        where: { tenantId_name: { tenantId: baseTenant.id, name } },
      });

      expect(row).toBeTruthy();
      expect(row?.tenantId).toBe(baseTenant.id);
      expect(row?.name).toBe(name);
    });
    it("returns 403 when principal has ADMIN role", async () => {
      const email = `user@${clientTenant.slug}.nl`;
      const { api } = await setupAuthenticatedPrincipal({
        app,
        prisma: container.prisma,
        container,
        tenant: clientTenant,
        email,
        userRoles: [{name: "ADMIN"}],
      });

      const name = "NEW_ROLE";

      const response = await api.post(`/api/t/${clientTenant.slug}/roles`).send({
        name,
      });

      expectAppError(response, 403, "FORBIDDEN");
    });
    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, clientTenant.slug);

      const name = "NEW_ROLE";

      const response = await api.post(`/api/t/${clientTenant.slug}/roles`).send({
        name,
      });

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("authentication / tenant resolution", () => {
    it("returns 404 when tenantSlug in path is missing", async () => {
      const api = createApiClient(app, undefined);

      const name = "NEW_ROLE";

      const response = await api.post("/api/roles").send({
        name,
      });

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });

    it("returns 404 when tenantSlug in path is empty", async () => {
      const api = createApiClient(app, "");

      const name = "NEW_ROLE";

      const response = await api.post("/api/roles").send({
        name,
      });

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });
  });

  describe("business rules", () => {
    it("returns 409 when role name already exists in tenant", async () => {
      const email = `user@${baseTenant.slug}.nl`;
      const { api } = await setupAuthenticatedPrincipal({
        app,
        prisma: container.prisma,
        container,
        tenant: baseTenant,
        email,
        userRoles: [{name: "SUPER_ADMIN"}],
      });

      const name = "NEW_ROLE";

      const first = await api.post(`/api/t/${baseTenant.slug}/roles`).send({
        name,
      });

      const payload = expectAppSuccessWithPayload(first, {
        status: 201,
      });
      expectRoleDto(payload, {
        tenantId: baseTenant.id,
        name,
      });

      const second = await api.post(`/api/t/${baseTenant.slug}/roles`).send({
        name,
      });

      expectAppError(second, 409, "CONFLICT");
    });
  });

  describe("validation", () => {
    it("returns 422 when role name is missing", async () => {
      const email = `user@${baseTenant.slug}.nl`;
      const { api } = await setupAuthenticatedPrincipal({
        app,
        prisma: container.prisma,
        container,
        tenant: baseTenant,
        email,
        userRoles: [{name: "SUPER_ADMIN"}],
      });

      const first = await api.post(`/api/t/${baseTenant.slug}/roles`).send({});

      expectAppError(first, 422, "VALIDATION_ERROR");

      const second = await api.post(`/api/t/${baseTenant.slug}/roles`).send({
        name: null,
      });

      expectAppError(second, 422, "VALIDATION_ERROR");

      const third = await api.post(`/api/t/${baseTenant.slug}/roles`).send({
        name: "",
      });

      expectAppError(third, 422, "VALIDATION_ERROR");
    });
  });
});
