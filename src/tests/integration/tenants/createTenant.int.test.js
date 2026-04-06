/**
 * File: src/tests/integration/tenants/createTenant.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import {
  expectAppSuccess,
  expectAppSuccessWithPayload,
} from "../../helpers/assertions/expectAppSuccess.js";
import { expectTenantAdminDto } from "../../helpers/assertions/expectTenantAdminDto.js";

describe("CreateTenant (integration) POST /api/tenants", () => {
  let container;
  let app;
  let baseTenant;

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
      email: "superadmin@example.com",
      roleNames: ["SUPER_ADMIN"],
    });
  }

  async function setupAdmin() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: baseTenant,
      email: "admin@example.com",
      roleNames: ["ADMIN"],
    });
  }

  describe("authorization", () => {
    it("returns 201 when user has SUPER_ADMIN role", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.post("/api/tenants").send({
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        type: "CLIENT",
      });

      const payload = expectAppSuccessWithPayload(response, { status: 201 });

      expectTenantAdminDto(payload, {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
        type: "CLIENT",
      });

      const row = await container.prisma.tenant.findUnique({
        where: { slug: "mozer-consulting" },
      });

      expect(row).toBeTruthy();
      expect(row?.name).toBe("Mozer Consulting");
      expect(row?.slug).toBe("mozer-consulting");
      expect(row?.status).toBe("ACTIVE");
      expect(row?.type).toBe("CLIENT");
    });

    it("returns 403 when user has ADMIN role", async () => {
      const { api } = await setupAdmin();

      const response = await api.post("/api/tenants").send({
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        type: "CLIENT",
      });

      expectAppError(response, 403, "FORBIDDEN");
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, baseTenant.slug);

      const response = await api.post("/api/tenants").send({
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        type: "CLIENT",
      });

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("business rules", () => {
    it("returns 409 when a second BASE tenant is created", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.post("/api/tenants").send({
        name: "Second Base",
        slug: "second-base",
        type: "BASE",
      });

      expectAppError(response, 409, "CONFLICT");
    });

    it("returns 409 when a second DEMO tenant is created", async () => {
      const { api } = await setupSuperAdmin();

      const first = await api.post("/api/tenants").send({
        name: "First Demo",
        slug: "first-demo",
        type: "DEMO",
      });

      const payload = expectAppSuccessWithPayload(first, { status: 201 });
      expectTenantAdminDto(payload, {
        name: "First Demo",
        slug: "first-demo",
        type: "DEMO",
      });

      const second = await api.post("/api/tenants").send({
        name: "Second Demo",
        slug: "second-demo",
        type: "DEMO",
      });

      expectAppError(second, 409, "CONFLICT");
    });

    it("creates multiple CLIENT tenants", async () => {
      const { api } = await setupSuperAdmin();

      const first = await api.post("/api/tenants").send({
        name: "First Client",
        slug: "first-client",
        type: "CLIENT",
      });

      const payload_first = expectAppSuccessWithPayload(first, { status: 201 });
      expectTenantAdminDto(payload_first, {
        name: "First Client",
        slug: "first-client",
        status: "ACTIVE",
        type: "CLIENT",
      });

      const second = await api.post("/api/tenants").send({
        name: "Second Client",
        slug: "second-client",
        type: "CLIENT",
      });

      const payload_second = expectAppSuccessWithPayload(second, {
        status: 201,
      });
      expectTenantAdminDto(payload_second, {
        name: "Second Client",
        slug: "second-client",
        status: "ACTIVE",
        type: "CLIENT",
      });

      const rows = await container.prisma.tenant.findMany({
        where: {
          slug: {
            in: ["first-client", "second-client"],
          },
        },
        orderBy: {
          slug: "asc",
        },
      });

      expect(rows).toHaveLength(2);
      expect(rows.map((row) => row.slug)).toEqual([
        "first-client",
        "second-client",
      ]);
      expect(rows.every((row) => row.type === "CLIENT")).toBe(true);
    });
  });

  describe("validation", () => {
    it("returns 409 when slug already exists", async () => {
      const { api } = await setupSuperAdmin();

      const testSlug = "test-slug";

      const first = await api.post("/api/tenants").send({
        name: "Client",
        slug: testSlug,
        type: "CLIENT",
      });

      expectAppSuccess(first, { status: 201 });

      const response = await api.post("/api/tenants").send({
        name: "Another Client",
        slug: testSlug,
        type: "CLIENT",
      });

      expectAppError(response, 409, "CONFLICT");
    });

    it("returns 422 when slug contains spaces", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.post("/api/tenants").send({
        name: "Another Client",
        slug: "another client",
        type: "CLIENT",
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when slug contains double hyphen", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.post("/api/tenants").send({
        name: "Another Client",
        slug: "another--client",
        type: "CLIENT",
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when slug starts with hyphen", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.post("/api/tenants").send({
        name: "Another Client",
        slug: "-anotherclient",
        type: "CLIENT",
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when slug ends with hyphen", async () => {
      const { api } = await setupSuperAdmin();

      const response = await api.post("/api/tenants").send({
        name: "Another Client",
        slug: "anotherclient-",
        type: "CLIENT",
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when slug contains not only [a-z], [0-9], [-] ", async () => {
      const { api } = await setupSuperAdmin();

      const first = await api.post("/api/tenants").send({
        name: "Another Client",
        slug: "Slug",
        type: "CLIENT",
      });

      expectAppError(first, 422, "VALIDATION_ERROR");

      const second = await api.post("/api/tenants").send({
        name: "Another Client",
        slug: "$lug",
        type: "CLIENT",
      });

      expectAppError(second, 422, "VALIDATION_ERROR");
    });
  });
});
