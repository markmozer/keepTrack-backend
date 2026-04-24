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
import { expectUserDetailDto } from "../../helpers/assertions/expectUserDetailDto.js";
import { expectValidDate } from "../../helpers/assertions/expectValidDate.js";

describe("AssignRoleToUser (integration) POST /api/t/:tenantSlug/role-assignments", () => {
  const endpoint = "/api/role-assignments";
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
    const resolvedUserRole = roleName ? {name: roleName.toUpperCase()} : {name: "USER_ADMIN"};
    const resolvedEmail = `${roleName.toLowerCase()}-${randomUUID().slice(0, 8)}@example.com`;

    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: resolvedTenant,
      email: resolvedEmail,
      userRoles: [resolvedUserRole],
    });
  }

  async function seedTestUser({
    tenant,
    status,
    userRoles,
    passwordPlain = null,
  } = {}) {
    const resolvedStatus = status ?? UserStatus.NEW;
    const resolvedUserRoles = userRoles ?? [];

    const user = await seedUser({
      prisma: container.prisma,
      container,
      defaultTenant: primaryTenant,
      tenant,
      userRoles: resolvedUserRoles,
      status: resolvedStatus,
      passwordPlain,
    });

    return user;
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

    return api.post(endpoint).send({
      targetUserId: userId,
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

      const targetUser = await seedTestUser();

      const targetRole = await seedTargetRole();

      const now = container.services.clockService.now();

      const response = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: targetRole.id,
          validFrom: now,
          validTo: null,
        });

      const payload = expectAppSuccessWithPayload(response, {
        status: 201,
      });

      expectUserDetailDto(payload, {
        tenantId: primaryTenant.id,
        id: payload.id,
        email: payload.email,
        status: UserStatus.NEW,
        inviteTokenExpiresAt: null,
        resetTokenExpiresAt: null,
      });

      const userRole = payload.userRoles[0];
      expect(typeof userRole.id).toBe("string");
      expect(userRole.roleId).toBe(targetRole.id);
      expect(userRole.validFrom).toBe(now.toISOString());
      expect(userRole.validTo).toBeNull();
      expectValidDate(userRole.createdAt);
      expectValidDate(userRole.updatedAt);

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

      const targetUser = await seedTestUser();
      const targetRole = await seedTargetRole();

      const response = await assignRole(api, targetUser.id, targetRole.id);

      expectAppError(response, 403, "FORBIDDEN");
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, primaryTenant.slug);
      const targetUser = await seedTestUser();
      const targetRole = await seedTargetRole();

      const response = await assignRole(api, targetUser.id, targetRole.id);

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("tenant resolution", () => {
    it("returns 404 when tenant route segment is missing", async () => {
      const api = createApiClient(app, undefined);
      const targetUser = await seedTestUser();
      const targetRole = await seedTargetRole();

      const response = await assignRole(api, targetUser.id, targetRole.id);

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });

    it("returns 404 when tenant slug is empty", async () => {
      const api = createApiClient(app, "");
      const targetUser = await seedTestUser();
      const targetRole = await seedTargetRole();

      const response = await assignRole(api, targetUser.id, targetRole.id);

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
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

      const now = container.services.clockService.now();
      const futureValidFrom = container.services.clockService.addDays(now, 14);

      const targetUser = await seedTestUser({
        userRoles: [{ name: "USER_VIEWER", validFrom: now }],
      });

      const response = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: targetRole.id,
          validFrom: futureValidFrom,
          validTo: null,
        });

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expectUserDetailDto(payload, {
        tenantId: primaryTenant.id,
        id: payload.id,
        email: payload.email,
        status: UserStatus.NEW,
        inviteTokenExpiresAt: null,
        resetTokenExpiresAt: null,
      });

      expect(payload.userRoles.length).toBe(1);
      const userRole = payload.userRoles[0];
      expect(userRole.id).toBe(targetUser.userRoles[0].id);
      expect(userRole.roleId).toBe(targetRole.id);
      expect(userRole.validFrom).toBe(now.toISOString());
      expect(userRole.validTo).toBeNull();
      expectValidDate(userRole.createdAt);
      expectValidDate(userRole.updatedAt);
      expect(userRole.roleName).toBe("USER_VIEWER");

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

      const targetUser = await seedTestUser({
        tenant: secondaryTenant,
      });

      const targetRole = await seedTargetRole();

      const response = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
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

      const targetUser = await seedTestUser();

      const targetRole = await seedTargetRole({
        tenant: secondaryTenant,
        name: "USER_VIEWER",
      });

      const response = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: targetRole.id,
        });

      expectAppError(response, 404, "RESOURCE_NOT_FOUND");
    });
  });

  describe("validation", () => {
    it("returns 422 when targetUserId is missing, empty, null, or invalid", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetRole = await seedTargetRole();

      const responseWithoutTargetUserId = await api.post(endpoint).send({
        roleId: targetRole.id,
      });

      expectAppError(responseWithoutTargetUserId, 422, "VALIDATION_ERROR");

      const responseWithTargetUserIdNull = await api.post(endpoint).send({
        targetUserId: null,
        roleId: targetRole.id,
      });

      expectAppError(responseWithTargetUserIdNull, 422, "VALIDATION_ERROR");

      const responseWithTargetUserIdEmpty = await api.post(endpoint).send({
        targetUserId: "",
        roleId: targetRole.id,
      });

      expectAppError(responseWithTargetUserIdEmpty, 422, "VALIDATION_ERROR");

      const responseWithTargetUserIdInvalid = await api.post(endpoint).send({
        targetUserId: "not-a-uuid",
        roleId: targetRole.id,
      });

      expectAppError(responseWithTargetUserIdInvalid, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when roleId is missing, empty, or null", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetUser = await seedTestUser();
      const now = container.services.clockService.now();

      const responseWithoutRoleId = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          validFrom: now,
          validTo: null,
        });

      expectAppError(responseWithoutRoleId, 422, "VALIDATION_ERROR");

      const responseWithRoleIdNull = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: null,
          validFrom: now,
          validTo: null,
        });

      expectAppError(responseWithRoleIdNull, 422, "VALIDATION_ERROR");

      const responseWithRoleIdEmpty = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
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

      const targetUser = await seedTestUser();

      const response = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: "not-a-uuid",
        });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when validFrom is not a valid date or null", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_ADMIN",
      });

      const targetUser = await seedTestUser();
      const targetRole = await seedTargetRole();

      const responseOne = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: targetRole.id,
          validFrom: "yesterday",
          validTo: null,
        });

      expectAppError(responseOne, 422, "VALIDATION_ERROR");

      const responseTwo = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
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

      const targetUser = await seedTestUser();
      const targetRole = await seedTargetRole();
      const now = container.services.clockService.now();

      const responseOne = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: targetRole.id,
          validFrom: now,
          validTo: "tomorrow",
        });

      expectAppError(responseOne, 422, "VALIDATION_ERROR");

      const responseTwo = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
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

      const targetUser = await seedTestUser();
      const targetRole = await seedTargetRole();

      const validFrom = container.services.clockService.now();
      const validTo = container.services.clockService.addDays(validFrom, -1);

      const responseOne = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: targetRole.id,
          validFrom,
          validTo,
        });

      expectAppError(responseOne, 422, "VALIDATION_ERROR");

      const responseTwo = await api
        .post(endpoint)
        .send({
          targetUserId: targetUser.id,
          roleId: targetRole.id,
          validFrom,
          validTo: validFrom,
        });

      expectAppError(responseTwo, 422, "VALIDATION_ERROR");
    });
  });
});
