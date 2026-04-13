/**
 * File: src/tests/integration/users/CreateUser.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectUserAdminDto } from "../../helpers/assertions/expectUserAdminDto.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";

describe("CreateUser (integration) POST /api/users", () => {
  let container;
  let app;
  let clientTenant;

  beforeAll(async () => {
    ({ app, container } = await createTestApp());
  });

  beforeEach(async () => {
    await resetDatabase({ prisma: container.prisma });

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

  async function setupUserAdmin() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: clientTenant,
      email: `user_admin@${clientTenant.slug}.nl`,
      roleNames: ["USER_ADMIN"],
    });
  }

  async function setupUserEditor() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: clientTenant,
      email: `user_editor@${clientTenant.slug}.nl`,
      roleNames: ["USER_EDITOR"],
    });
  }

  describe("authorization", () => {
    it("returns 201 when principal has USER_ADMIN role", async () => {
      const { api } = await setupUserAdmin();

      const email_new = `new_user@${clientTenant.slug}.nl`;

      const response = await api.post("/api/users").send({
        email: email_new,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 201,
      });

      expectUserAdminDto(payload, {
        tenantId: clientTenant.id,
        email: email_new,
        status: "NEW",
        roleNames: [],
        inviteTokenExpiresAt: null,
        resetTokenExpiresAt: null,
      });

      const row = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: clientTenant.id,
            email: email_new,
          },
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      expect(row).toBeTruthy();
      expect(row?.tenantId).toBe(clientTenant.id);
      expect(row?.email).toBe(email_new);
      expect(row?.status).toBe("NEW");
      expect(row?.inviteTokenExpiresAt).toBeNull();
      expect(row?.resetTokenExpiresAt).toBeNull();
      expect(row?.createdAt).toBeInstanceOf(Date);
      expect(row?.updatedAt).toBeInstanceOf(Date);

      const roleNames =
        row?.userRoles.map((userRole) => userRole.role.name) ?? [];
      expect(roleNames).toEqual([]);
    });
    it("returns 403 when principal has USER_EDITOR role", async () => {
      const { api } = await setupUserEditor();

      const email_new = `new_user@${clientTenant.slug}.nl`;

      const response = await api.post("/api/users").send({
        email: email_new,
      });

      expectAppError(response, 403, "FORBIDDEN");
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, clientTenant.slug);

      const email_new = `new_user@${clientTenant.slug}.nl`;

      const response = await api.post("/api/users").send({
        email: email_new,
      });

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("tenant resolution", () => {
    it("returns 400 when X-Tenant-Slug header is missing", async () => {
      const api = createApiClient(app, undefined);

      const email_new = `new_user@${clientTenant.slug}.nl`;

      const response = await api.post("/api/users").send({
        email: email_new,
      });

      expectAppError(response, 400, "BAD_REQUEST");
    });

    it("returns 400 when X-Tenant-Slug header is empty", async () => {
      const api = createApiClient(app, "");

      const email_new = `new_user@${clientTenant.slug}.nl`;

      const response = await api.post("/api/users").send({
        email: email_new,
      });

      expectAppError(response, 400, "BAD_REQUEST");
    });
  });

  describe("business rules", () => {
    it("returns 409 when email already exists in tenant", async () => {
      const { api } = await setupUserAdmin();

      const email_new = `new_user@${clientTenant.slug}.nl`;

      const first = await api.post("/api/users").send({
        email: email_new,
      });

      const payload = expectAppSuccessWithPayload(first, {
        status: 201,
      });

      expectUserAdminDto(payload, {
        tenantId: clientTenant.id,
        email: email_new,
        status: "NEW",
        roleNames: [],
        inviteTokenExpiresAt: null,
        resetTokenExpiresAt: null,
      });

      const second = await api.post("/api/users").send({
        email: email_new,
      });

      expectAppError(second, 409, "CONFLICT");
    });
    it("returns 201 when email already exists in another tenant", async () => {
      const otherTenant = await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Other Tenant",
          slug: "other-tenant",
          type: "CLIENT",
        },
      });

      const duplicateEmail = "shared@example.com";

      await container.prisma.user.create({
        data: {
          tenantId: otherTenant.id,
          email: duplicateEmail,
          status: "NEW",
        },
      });

      const { api } = await setupUserAdmin();

      const response = await api.post("/api/users").send({
        email: duplicateEmail,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 201,
      });

      expectUserAdminDto(payload, {
        tenantId: clientTenant.id,
        email: duplicateEmail,
        status: "NEW",
        roleNames: [],
        inviteTokenExpiresAt: null,
        resetTokenExpiresAt: null,
      });
    });
  });

  describe("validation", () => {
    it("returns 422 when email is missing", async () => {
      const { api } = await setupUserAdmin();

      const first = await api.post("/api/users").send({});

      expectAppError(first, 422, "VALIDATION_ERROR");

      const second = await api.post("/api/users").send({
        email: null,
      });

      expectAppError(second, 422, "VALIDATION_ERROR");

      const third = await api.post("/api/users").send({
        email: "",
      });

      expectAppError(third, 422, "VALIDATION_ERROR");
    });
    it("returns 422 when email is not valid", async () => {
      const { api } = await setupUserAdmin();

      const first = await api.post("/api/users").send({
        email: "mark mozer",
      });

      expectAppError(first, 422, "VALIDATION_ERROR");

      const second = await api.post("/api/users").send({
        email: "mark$mozer-consulting.com",
      });

      expectAppError(second, 422, "VALIDATION_ERROR");
    });
  });
});
