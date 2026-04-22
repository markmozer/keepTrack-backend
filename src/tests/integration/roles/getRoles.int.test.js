/**
 * File: src/tests/integration/roles/getRoles.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { seedRole } from "../../helpers/seed/seedRole.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectRoleList } from "../../helpers/assertions/expectRoleList.js";

describe("GetRoles (integration) GET /api/roles", () => {
  let container;
  let app;
  let clientTenant;
  const roleNames = [
    "AAAAAA_A",
    "AAAAAA_B",
    "AAAAAA_C",
    "AAAAAA_D",
    "AAAAAA_E1",
    "AAAAAA_E2",
  ];

  beforeAll(async () => {
    ({ app, container } = await createTestApp());
  });

  beforeEach(async () => {
    await resetDatabase({ prisma: container.prisma });

    clientTenant = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Client tenant",
        slug: "client-tenant",
        type: "CLIENT",
        status: "ACTIVE",
      },
    });

    for (const roleName of roleNames) {
      await seedRole({
        prisma: container.prisma,
        payload: {
          tenantId: clientTenant.id,
          name: roleName,
        },
      });
    }
  });

  afterAll(async () => {
    if (container) {
      await container.shutdown();
    }
  });

  async function setupUserViewer() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: clientTenant,
      email: "user_viewer@example.com",
      userRoles: [{name: "USER_VIEWER"}],
    });
  }

  async function setupContractAdmin() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: clientTenant,
      email: "contract_admin@example.com",
      userRoles: [{name: "CONTRACT_ADMIN"}],
    });
  }
  describe("authorization", () => {
    it("returns 200 when user has USER_VIEWER role", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles");

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectRoleList(payload, { page: 1, pageSize: 25 });
    });

    it("returns 403 when user has CONTRACT_ADMIN role", async () => {
      const { api } = await setupContractAdmin();

      const response = await api.get("/api/roles");

      expectAppError(response, 403, "FORBIDDEN");
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, clientTenant.slug);

      const response = await api.get("/api/roles");

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("default behavior", () => {
    it("returns all roles with default pagination", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles");

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectRoleList(payload, { page: 1, pageSize: 25 });

      expect(payload.items).toHaveLength(7);
      expect(payload.totalItems).toBe(7);

      expect(payload.items.map((item) => item.name)).toEqual(
        expect.arrayContaining(roleNames),
      );
    });
  });

  describe("filtering", () => {
    it("filters roles by name", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles").query({
        roleName: "AAAAAA_E",
      });

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectRoleList(payload, { page: 1, pageSize: 25 });
      expect(payload.totalItems).toBe(2);
      expect(payload.items).toHaveLength(2);
    });
  });

  describe("sorting", () => {
    it("sorts roles by name ascending", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles").query({
        roleName: "AAAAAA",
        sortField: "name",
        sortDirection: "asc",
      });

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectRoleList(payload, { page: 1, pageSize: 25 });

      expect(payload.items.map((item) => item.name)).toEqual([
        "AAAAAA_A",
        "AAAAAA_B",
        "AAAAAA_C",
        "AAAAAA_D",
        "AAAAAA_E1",
        "AAAAAA_E2",
      ]);
    });

    it("sorts roles by name descending", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles").query({
        roleName: "AAAAAA",
        sortField: "name",
        sortDirection: "desc",
      });

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectRoleList(payload, { page: 1, pageSize: 25 });

      expect(payload.items.map((item) => item.name)).toEqual([
        "AAAAAA_E2",
        "AAAAAA_E1",
        "AAAAAA_D",
        "AAAAAA_C",
        "AAAAAA_B",
        "AAAAAA_A",
      ]);
    });
  });

  describe("pagination", () => {
    it("returns the first page with the requested page size", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles").query({
        roleName: "AAAAAA",
        page: 1,
        pageSize: 2,
        sortField: "name",
        sortDirection: "asc",
      });

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectRoleList(payload, { page: 1, pageSize: 2 });
      expect(payload.totalItems).toBe(6);
      expect(payload.items).toHaveLength(2);
      expect(payload.items.map((item) => item.name)).toEqual([
        "AAAAAA_A",
        "AAAAAA_B",
      ]);
    });

    it("returns the second page with the requested page size", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles").query({
        roleName: "AAAAAA",
        page: 2,
        pageSize: 2,
        sortField: "name",
        sortDirection: "asc",
      });

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectRoleList(payload, { page: 2, pageSize: 2 });
      expect(payload.totalItems).toBe(6);
      expect(payload.items).toHaveLength(2);
      expect(payload.items.map((item) => item.name)).toEqual([
        "AAAAAA_C",
        "AAAAAA_D",
      ]);
    });
  });

  describe("validation", () => {
    it("returns 422 when page is invalid", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles").query({
        page: 0,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when pageSize is invalid", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles").query({
        pageSize: -1,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when sort direction is invalid", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles").query({
        sortField: "name",
        sortDirection: "sideways",
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });
  describe("tenant isolation", () => {
    it("returns only roles from the principal tenant", async () => {
      const otherTenant = await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Other Tenant",
          slug: "other-tenant",
          type: "CLIENT",
          status: "ACTIVE",
        },
      });

      await seedRole({
        prisma: container.prisma,
        payload: {
          tenantId: otherTenant.id,
          name: "OTHER_ROLE",
        },
      });

      const { api } = await setupUserViewer();

      const response = await api.get("/api/roles");

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectRoleList(payload, { page: 1, pageSize: 25 });

      expect(payload.items.map((item) => item.name)).not.toContain(
        "OTHER_ROLE",
      );
    });
  });
  describe("tenant resolution", () => {
    it("returns 400 when X-Tenant-Slug header is missing", async () => {
      const api = createApiClient(app, undefined);

      const response = await api.get("/api/roles");

      expectAppError(response, 400, "BAD_REQUEST");
    });

    it("returns 400 when X-Tenant-Slug header is empty", async () => {
      const api = createApiClient(app, "");

      const response = await api.get("/api/roles");

      expectAppError(response, 400, "BAD_REQUEST");
    });
  });
});
