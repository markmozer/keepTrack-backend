/**
 * File: src/tests/integration/userRoles/assignRoleToUser.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { seedUser } from "../../helpers/seed/seedUser.js";
import { seedRole } from "../../helpers/seed/seedRole.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectUserRoleAdminDto } from "../../helpers/assertions/expectUserRoleAdminDto.js";

describe("AssignRoleToUser (integration) POST /api/users/:userId/roles", () => {
  const endpoint = "/api/users";
  let app;
  let container;
  let primaryTenant;

  beforeAll(async () => {
    ({ app, container } = await createTestApp());
  });

  beforeEach(async () => {
    await resetDatabase({ prisma: container.prisma });

    primaryTenant = await seedTenant({
      prisma: container.prisma,
      payload: {
        name: "Primary Tenant",
        slug: "primary-tenant",
        type: "CLIENT",
      },
    });
  });

  afterAll(async () => {
    if (container) {
      await container.shutdown();
    }
  });

  async function setupAuthSingleRolePrincipal({ tenant, roleName } = {}) {
    const resolvedTenant = tenant ?? primaryTenant;
    const resolvedRoleName = roleName ? roleName.toUpperCase() : "USER_ADMIN";
    const resolvedEmail = `${resolvedRoleName.toLowerCase()}-${randomUUID().slice(0, 8)}@example.com`;

    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: resolvedTenant,
      email: resolvedEmail,
      roleNames: [resolvedRoleName],
    });
  }

  async function seedTargetUser({ tenant = primaryTenant } = {}) {
    return seedUser({
      prisma: container.prisma,
      passwordService: container.services.passwordService,
      payload: {
        tenantId: tenant.id,
        status: UserStatus.NEW,
        passwordPlain: null,
      },
    });
  }

  async function seedTargetRole({
    tenant = primaryTenant,
    name = "USER_VIEWER",
  } = {}) {
    return seedRole({
      prisma: container.prisma,
      payload: {
        tenantId: tenant.id,
        name,
      },
    });
  }

  async function assignRole(api, userId, roleId, overrides = {}) {
    const now = container.services.clockService.now();

    return api.post(`${endpoint}/${userId}/roles`).send({
      roleId,
      validFrom: now,
      validTo: null,
      ...overrides,
    });
  }

  async function expectPersistedUserRole({
    tenantId,
    userId,
    roleId,
    validFrom,
    validTo = null,
  }) {
    const row = await container.prisma.userRole.findUnique({
      where: {
        tenantId_userId_roleId: {
          tenantId,
          userId,
          roleId,
        },
      },
    });

    expect(row).toBeTruthy();
    expect(row?.tenantId).toBe(tenantId);
    expect(row?.userId).toBe(userId);
    expect(row?.roleId).toBe(roleId);
    expect(row?.validFrom).toBeInstanceOf(Date);

    const actualValidFrom = new Date(row?.validFrom).getTime();
    const expectedValidFrom = new Date(validFrom).getTime();

    expect(Math.abs(actualValidFrom - expectedValidFrom)).toBeLessThan(10);

    expect(row?.validTo).toBe(validTo);
    expect(row?.createdAt).toBeInstanceOf(Date);
    expect(row?.updatedAt).toBeInstanceOf(Date);
  }

  describe("authorization", () => {
    it("returns 201 when called by user with USER_ADMIN role", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetUser = await seedTargetUser();
      const targetRole = await seedTargetRole();
      const now = container.services.clockService.now();

      const response = await api.post(`${endpoint}/${targetUser.id}/roles`).send({
        roleId: targetRole.id,
        validFrom: now,
        validTo: null,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 201,
      });

      expectUserRoleAdminDto(payload, {
        tenantId: primaryTenant.id,
        userId: targetUser.id,
        roleId: targetRole.id,
        validFrom: now.toISOString(),
        validTo: null,
        roleName: "USER_VIEWER",
      });

      await expectPersistedUserRole({
        tenantId: primaryTenant.id,
        userId: targetUser.id,
        roleId: targetRole.id,
        validFrom: now,
        validTo: null,
      });
    });

    it("returns 403 when principal has USER_EDITOR role", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const targetUser = await seedTargetUser();
      const targetRole = await seedTargetRole();

      const response = await assignRole(api, targetUser.id, targetRole.id);

      expectAppError(response, 403, "FORBIDDEN");
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, primaryTenant.slug);
      const targetUser = await seedTargetUser();
      const targetRole = await seedTargetRole();

      const response = await assignRole(api, targetUser.id, targetRole.id);

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("tenant resolution", () => {
    it("returns 400 when X-Tenant-Slug header is missing", async () => {
      const api = createApiClient(app, undefined);
      const targetUser = await seedTargetUser();
      const targetRole = await seedTargetRole();

      const response = await assignRole(api, targetUser.id, targetRole.id);

      expectAppError(response, 400, "BAD_REQUEST");
    });

    it("returns 400 when X-Tenant-Slug header is empty", async () => {
      const api = createApiClient(app, "");
      const targetUser = await seedTargetUser();
      const targetRole = await seedTargetRole();

      const response = await assignRole(api, targetUser.id, targetRole.id);

      expectAppError(response, 400, "BAD_REQUEST");
    });
  });

  describe("routing", () => {
    it("returns 404 when userId path param is missing or empty", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetRole = await seedTargetRole();
      const now = container.services.clockService.now();

      const responseOne = await api.post(`${endpoint}/roles`).send({
        roleId: targetRole.id,
        validFrom: now,
        validTo: null,
      });

      expectAppError(responseOne, 404, "ROUTE_NOT_FOUND");

      const responseTwo = await api.post(`${endpoint}//roles`).send({
        roleId: targetRole.id,
        validFrom: now,
        validTo: null,
      });

      expectAppError(responseTwo, 404, "ROUTE_NOT_FOUND");
    });
  });

  describe("business rules", () => {
    it("returns 200 with existing assignment when role is already assigned", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetRole = await seedTargetRole({
        name: "USER_VIEWER",
      });

      const targetUser = await seedUser({
        prisma: container.prisma,
        passwordService: container.services.passwordService,
        payload: {
          tenantId: primaryTenant.id,
          status: UserStatus.NEW,
          passwordPlain: null,
          roleNames: ["USER_VIEWER"],
        },
      });

      const now = container.services.clockService.now();
      const futureValidFrom = container.services.clockService.addDays(now, 14);

      const response = await api.post(`${endpoint}/${targetUser.id}/roles`).send({
        roleId: targetRole.id,
        validFrom: futureValidFrom,
        validTo: null,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expectUserRoleAdminDto(payload, {
        tenantId: primaryTenant.id,
        userId: targetUser.id,
        roleId: targetRole.id,
        validFrom: now.toISOString(),
        validTo: null,
        roleName: "USER_VIEWER",
      });

      await expectPersistedUserRole({
        tenantId: primaryTenant.id,
        userId: targetUser.id,
        roleId: targetRole.id,
        validFrom: now,
        validTo: null,
      });
    });
  });

  describe("not found / tenant isolation", () => {
    it("returns 404 when target user belongs to another tenant", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const secondaryTenant = await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Secondary Tenant",
          slug: "secondary-tenant",
          type: "CLIENT",
        },
      });

      const targetUser = await seedTargetUser({
        tenant: secondaryTenant,
      });

      const targetRole = await seedTargetRole();

      const response = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: targetRole.id,
        });

      expectAppError(response, 404, "RESOURCE_NOT_FOUND");
    });

    it("returns 404 when target role belongs to another tenant", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const secondaryTenant = await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Secondary Tenant",
          slug: "secondary-tenant",
          type: "CLIENT",
        },
      });

      const targetUser = await seedTargetUser();

      const targetRole = await seedTargetRole({
        tenant: secondaryTenant,
        name: "USER_VIEWER",
      });

      const response = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: targetRole.id,
        });

      expectAppError(response, 404, "RESOURCE_NOT_FOUND");
    });
  });

  describe("validation", () => {
    it("returns 422 when userId is not a valid UUID", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetRole = await seedTargetRole();

      const response = await api.post(`${endpoint}/not-a-uuid/roles`).send({
        roleId: targetRole.id,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when roleId is missing, empty, or null", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetUser = await seedTargetUser();
      const now = container.services.clockService.now();

      const responseWithoutRoleId = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          validFrom: now,
          validTo: null,
        });

      expectAppError(responseWithoutRoleId, 422, "VALIDATION_ERROR");

      const responseWithRoleIdNull = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: null,
          validFrom: now,
          validTo: null,
        });

      expectAppError(responseWithRoleIdNull, 422, "VALIDATION_ERROR");

      const responseWithRoleIdEmpty = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: "",
          validFrom: now,
          validTo: null,
        });

      expectAppError(responseWithRoleIdEmpty, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when roleId is not a valid UUID", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetUser = await seedTargetUser();

      const response = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: "not-a-uuid",
        });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when validFrom is not a valid date or null", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetUser = await seedTargetUser();
      const targetRole = await seedTargetRole();

      const responseOne = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: targetRole.id,
          validFrom: "yesterday",
          validTo: null,
        });

      expectAppError(responseOne, 422, "VALIDATION_ERROR");

      const responseTwo = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: targetRole.id,
          validFrom: 123,
          validTo: null,
        });

      expectAppError(responseTwo, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when validTo is not a valid date or null", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetUser = await seedTargetUser();
      const targetRole = await seedTargetRole();
      const now = container.services.clockService.now();

      const responseOne = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: targetRole.id,
          validFrom: now,
          validTo: "tomorrow",
        });

      expectAppError(responseOne, 422, "VALIDATION_ERROR");

      const responseTwo = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: targetRole.id,
          validFrom: now,
          validTo: 123,
        });

      expectAppError(responseTwo, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when validTo is less than or equal to validFrom", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetUser = await seedTargetUser();
      const targetRole = await seedTargetRole();

      const validFrom = container.services.clockService.now();
      const validTo = container.services.clockService.addDays(validFrom, -1);

      const responseOne = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: targetRole.id,
          validFrom,
          validTo,
        });

      expectAppError(responseOne, 422, "VALIDATION_ERROR");

      const responseTwo = await api
        .post(`${endpoint}/${targetUser.id}/roles`)
        .send({
          roleId: targetRole.id,
          validFrom,
          validTo: validFrom,
        });

      expectAppError(responseTwo, 422, "VALIDATION_ERROR");
    });
  });
});