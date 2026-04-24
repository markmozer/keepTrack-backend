/**
 * File: src/tests/integration/users/inviteUser.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectUserDetailDto } from "../../helpers/assertions/expectUserDetailDto.js";
import { expectValidDate } from "../../helpers/assertions/expectValidDate.js";
import { seedUser } from "../../helpers/seed/seedUser.js";

describe("InviteUser (integration) POST /api/users/:userId/invite", () => {
  const endpoint = "/api/users";
  let app;
  let container;
  let primaryTenant;
  const defaultUserRole = [{ name: "USER_VIEWER" }];

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
    const resolvedUserRoles = userRoles ?? defaultUserRole;

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

  async function expectPersistedUser({ tenantId, id, email }) {
    const row = await container.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email,
        },
      },
    });

    expect(row).toBeTruthy();
    expect(row?.tenantId).toBe(tenantId);
    expect(row?.id).toBe(id);
    expect(row?.email).toBe(email);
    expect(row?.status).toBe(UserStatus.INVITED);
    expect(typeof row?.inviteTokenHash).toBe("string");
    expect(row?.inviteTokenHash.length).toBeGreaterThan(10);
    expect(row?.inviteTokenExpiresAt).toBeInstanceOf(Date);
    expect(row?.resetTokenHash).toBeNull();
    expect(row?.resetTokenExpiresAt).toBeNull();
    expect(row?.createdAt).toBeInstanceOf(Date);
    expect(row?.updatedAt).toBeInstanceOf(Date);
  }

  describe("authorization", () => {
    it("returns 200 when called by user with USER_EDITOR role", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const user = await seedTestUser();

      const response = await api.post(`${endpoint}/${user.id}/invite`);

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expectUserDetailDto(payload, {
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
        status: UserStatus.INVITED,
        roleNames: defaultUserRole,
        resetTokenExpiresAt: null,
      });

      expectValidDate(payload.inviteTokenExpiresAt);

      await expectPersistedUser({
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
      });
    });

    it("returns 403 when principal has USER_VIEWER role", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_VIEWER",
      });

      const targetRoleNames = [{name: "USER_VIEWER"}];

      const targetUser = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: primaryTenant,
        roleNames: targetRoleNames,
      });

      const response = await api.post(`${endpoint}/${targetUser.id}/invite`);

      expectAppError(response, 403, "FORBIDDEN");
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, primaryTenant.slug);

      const user = await seedTestUser();

      const response = await api.post(`${endpoint}/${user.id}/invite`);

      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("tenant resolution", () => {
    it("returns 404 when tenantSlug in path is missing", async () => {
      const api = createApiClient(app, undefined);

      const user = await seedTestUser();

      const response = await api.post(`${endpoint}/${user.id}/invite`);

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });

    it("returns 404 when tenantSlug in path is empty", async () => {
      const api = createApiClient(app, "");

      const user = await seedTestUser();

      const response = await api.post(`${endpoint}/${user.id}/invite`);

      expectAppError(response, 404, "ROUTE_NOT_FOUND");
    });
  });

  describe("routing", () => {
    it("returns 404 when userId path param is missing or empty", async () => {
      const api = createApiClient(app, primaryTenant.slug);

      const responseOne = await api.post(`${endpoint}/invite`);

      expectAppError(responseOne, 404, "ROUTE_NOT_FOUND");

      const responseTwo = await api.post(`${endpoint}//invite`);

      expectAppError(responseTwo, 404, "ROUTE_NOT_FOUND");
    });
  });

  describe("business rules", () => {
    it("returns 422 when user status is not invitable", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const user = await seedTestUser({ status: UserStatus.ACTIVE });

      const response = await api.post(`${endpoint}/${user.id}/invite`);

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
    it("returns 422 when user has no roles", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const user = await seedTestUser({ userRoles: [] });

      const response = await api.post(`${endpoint}/${user.id}/invite`);

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
    it("returns 422 when user has no valid roles now or in the future", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const now = await container.services.clockService.now();
      const validFrom = await container.services.clockService.addDays(now, -14);
      const validTo = await container.services.clockService.addDays(now, -7);

      const userRoles = [{ name: "USER_VIEWER", validFrom, validTo }];

      const user = await seedTestUser({ userRoles });

      const response = await api.post(`${endpoint}/${user.id}/invite`);

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
    it("returns 200 and refreshes invite token when inviting an already invited user", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const user = await seedTestUser();

      const first_response = await api.post(`${endpoint}/${user.id}/invite`);

      const first_payload = expectAppSuccessWithPayload(first_response, {
        status: 200,
      });

      expectUserDetailDto(first_payload, {
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
        status: UserStatus.INVITED,
        roleNames: defaultUserRole,
        resetTokenExpiresAt: null,
      });

      expectValidDate(first_payload.inviteTokenExpiresAt);

      const rowAfterFirstInvite = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: primaryTenant.id,
            email: user.email,
          },
        },
      });

      const firstInviteTokenHash = rowAfterFirstInvite?.inviteTokenHash;

      const second_response = await api.post(`${endpoint}/${user.id}/invite`);

      const second_payload = expectAppSuccessWithPayload(second_response, {
        status: 200,
      });

      expectUserDetailDto(second_payload, {
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
        status: UserStatus.INVITED,
        roleNames: defaultUserRole,
        resetTokenExpiresAt: null,
      });

      expectValidDate(second_payload.inviteTokenExpiresAt);

      const rowAfterSecondInvite = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: primaryTenant.id,
            email: user.email,
          },
        },
      });

      expect(rowAfterSecondInvite?.inviteTokenHash).not.toBe(
        firstInviteTokenHash,
      );
    });
  });

  describe("not found / tenant isolation", () => {
    it("returns 404 when target user belongs to another tenant", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const secondaryTenant = await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Secondary Tenant",
          slug: "secondary-tenant",
          type: "CLIENT",
        },
      });

      const user = await seedTestUser({ tenant: secondaryTenant });

      const response = await api.post(`${endpoint}/${user.id}/invite`);

      expectAppError(response, 404, "RESOURCE_NOT_FOUND");
    });
    it("returns 404 when userId does not exist", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const response = await api.post(`${endpoint}/${randomUUID()}/invite`);

      expectAppError(response, 404, "RESOURCE_NOT_FOUND");
    });
  });

  describe("validation", () => {
    it("returns 422 when userId is not a valid UUID", async () => {
      const { api } = await setupAuthSingleRolePrincipal({
        roleName: "USER_EDITOR",
      });

      const response = await api.post(`${endpoint}/not-a-uuid/invite`);

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });
});
