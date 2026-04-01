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

describe("GetTenants (integration) GET /api/tenants", () => {
  let container;
  let app;
  let baseTenant;
  let demoTenant;
  let clientAlpha;
  let clientBeta;
  let clientGamma;

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
        status: "ACTIVE",
      },
    });

    demoTenant = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Demo Tenant",
        slug: "demo",
        type: "DEMO",
        status: "ACTIVE",
      },
    });

    clientAlpha = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Alpha Client",
        slug: "alpha-client",
        type: "CLIENT",
        status: "ACTIVE",
      },
    });

    clientBeta = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Beta Client",
        slug: "beta-client",
        type: "CLIENT",
        status: "ACTIVE",
      },
    });

    clientGamma = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Gamma Client",
        slug: "gamma-client",
        type: "CLIENT",
        status: "INACTIVE",
      },
    });
  });

  afterAll(async () => {
    if (container) {
      await container.shutdown();
    }
  });

  async function setupSuperAdmin() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: baseTenant,
      email: "super_admin@example.com",
      roleNames: ["SUPER_ADMIN"],
    });
  }

  async function setupAdmin() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: clientAlpha,
      email: "admin@example.com",
      roleNames: ["ADMIN"],
    });
  }
  describe("authorization", () => {
    it("returns 200 when user has SUPER_ADMIN role", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.payload.items).toBeInstanceOf(Array);
    });

    it("returns 403 when user has ADMIN role", async () => {
      const { api } = await setupAdmin();

      const response = await api.get("/api/tenants");

      expectAppError(response, 403);
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, baseTenant.slug);

      const response = await api.get("/api/tenants");

      expectAppError(response, 401);
    });
  });

  describe("default behavior", () => {
    it("returns all tenants with default pagination", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.payload.items).toHaveLength(5);
      expect(response.body.payload.totalItems).toBe(5);

      expect(response.body.payload.items.map((item) => item.slug)).toEqual(
        expect.arrayContaining([
          "base",
          "demo",
          "alpha-client",
          "beta-client",
          "gamma-client",
        ]),
      );
    });
  });

  describe("filtering", () => {
    it("filters tenants by type", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "type": "CLIENT",
      });

      expect(response.status).toBe(200);
      expect(response.body.payload.totalItems).toBe(3);
      expect(response.body.payload.items).toHaveLength(3);
      expect(
        response.body.payload.items.every((item) => item.type === "CLIENT"),
      ).toBe(true);
    });

    it("filters tenants by status", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "status": "INACTIVE",
      });

      expect(response.status).toBe(200);
      expect(response.body.payload.totalItems).toBe(1);
      expect(response.body.payload.items).toHaveLength(1);
      expect(response.body.payload.items[0].slug).toBe("gamma-client");
    });
  });

  describe("sorting", () => {
    it("sorts tenants by name ascending", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "sortField": "name",
        "sortDirection": "asc",
      });

      expect(response.status).toBe(200);

      expect(response.body.payload.items.map((item) => item.name)).toEqual([
        "Alpha Client",
        "Base Tenant",
        "Beta Client",
        "Demo Tenant",
        "Gamma Client",
      ]);
    });

    it("sorts tenants by name descending", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "sortField": "name",
        "sortDirection": "desc",
      });

      expect(response.status).toBe(200);

      expect(response.body.payload.items.map((item) => item.name)).toEqual([
        "Gamma Client",
        "Demo Tenant",
        "Beta Client",
        "Base Tenant",
        "Alpha Client",
      ]);
    });
  });

  describe("pagination", () => {
    it("returns the first page with the requested page size", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "page": 1,
        "pageSize": 2,
        "sortField": "name",
        "sortDirection": "asc",
      });

      expect(response.status).toBe(200);
      expect(response.body.payload.totalItems).toBe(5);
      expect(response.body.payload.items).toHaveLength(2);
      expect(response.body.payload.items.map((item) => item.name)).toEqual([
        "Alpha Client",
        "Base Tenant",
      ]);
    });

    it("returns the second page with the requested page size", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "page": 2,
        "pageSize": 2,
        "sortField": "name",
        "sortDirection": "asc",
      });

      expect(response.status).toBe(200);
      expect(response.body.payload.totalItems).toBe(5);
      expect(response.body.payload.items).toHaveLength(2);
      expect(response.body.payload.items.map((item) => item.name)).toEqual([
        "Beta Client",
        "Demo Tenant",
      ]);
    });
  });

  describe("validation", () => {
    it("returns 422 when page is invalid", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "page": 0,
      });

      expectAppError(response, 422);
    });

    it("returns 422 when pageSize is invalid", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "pageSize": -1,
      });

      expectAppError(response, 422);
    });

    it("returns 422 when sort direction is invalid", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.get("/api/tenants").query({
        "sortField": "name",
        "sortDirection": "sideways",
      });

      expectAppError(response, 422);
    });
  });
});
