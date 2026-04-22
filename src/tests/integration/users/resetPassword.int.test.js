/**
 * File: src/tests/integration/users/acceptInvite.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { seedUser } from "../../helpers/seed/seedUser.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectUserDetailDto } from "../../helpers/assertions/expectUserDetailDto.js";

describe("AcceptInvite (integration) POST /api/users/accept-invite", () => {
  const endpoint = "/api/users/reset-password";
  const oldPassword = "Strong123!123";
  const newPassword = "NewStrong123!123";

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

  async function seedUserWithResetToken({
    passwordPlain = oldPassword,
    userRoles = [{ name: "USER_VIEWER" }],
    expiresAt,
    status = UserStatus.ACTIVE,
    tenant,
  } = {}) {
    const { tokenPlaintext, tokenHash } =
      await container.services.tokenService.generate();

    const now = container.services.clockService.now();
    const resetTokenExpiresAt =
      expiresAt ??
      container.services.clockService.addDays(
        now,
        container.appConfig.auth.inviteTtlDays,
      );

    const user = await seedUser({
      prisma: container.prisma,
      container,
      defaultTenant: primaryTenant,
      tenant,
      status,
      passwordPlain,
      resetTokenHash: tokenHash,
      resetTokenExpiresAt,
      userRoles,
    });

    return {
      user,
      tokenPlaintext,
      resetTokenExpiresAt,
    };
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
    expect(typeof row?.passwordHash).toBe("string");
    expect(row?.passwordHash.length).toBeGreaterThan(10);
    expect(row?.passwordHash).not.toBe(oldPassword);
    expect(row?.status).toBe(UserStatus.ACTIVE);
    expect(row?.inviteTokenHash).toBeNull();
    expect(row?.inviteTokenExpiresAt).toBeNull();
    expect(row?.resetTokenHash).toBeNull();
    expect(row?.resetTokenExpiresAt).toBeNull();
    expect(row?.createdAt).toBeInstanceOf(Date);
    expect(row?.updatedAt).toBeInstanceOf(Date);

    return row;
  }

  describe("core flow", () => {
    it("accepts a valid reset token, sets the new password and returns 200", async () => {
      const { user, tokenPlaintext } = await seedUserWithResetToken();

      const userBefore = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: user.tenantId,
            email: user.email,
          },
        },
      });

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: tokenPlaintext,
        password: newPassword,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expectUserDetailDto(payload, {
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
        status: UserStatus.ACTIVE,
        userRoles: [{ name: "USER_VIEWER" }],
        resetTokenExpiresAt: null,
      });

      expect(payload.resetTokenExpiresAt).toBeNull();

      const userAfter = await expectPersistedUser({
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
      });

      expect(userAfter.passwordHash).not.toBe(userBefore.passwordHash);
    });

    it("returns 422 when token is invalid (not found)", async () => {
      const { tokenPlaintext } = await seedUserWithResetToken();

      const api = createApiClient(app, primaryTenant.slug);

      const invalidToken = tokenPlaintext.slice(0, tokenPlaintext.length - 1);

      const response = await api.post(endpoint).send({
        token: invalidToken,
        password: newPassword,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when token is invalid (expired)", async () => {
      const now = container.services.clockService.now();
      const expiredAt = container.services.clockService.addDays(now, -1);

      const { tokenPlaintext } = await seedUserWithResetToken({
        expiresAt: expiredAt,
      });

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: tokenPlaintext,
        password: newPassword,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });

  describe("tenant resolution", () => {
    it("returns 400 when X-Tenant-Slug header is missing", async () => {
      const api = createApiClient(app, undefined);

      const response = await api.post(endpoint).send({
        token: "dummy-token",
        password: newPassword,
      });

      expectAppError(response, 400, "BAD_REQUEST");
    });

    it("returns 400 when X-Tenant-Slug header is empty", async () => {
      const api = createApiClient(app, "");

      const response = await api.post(endpoint).send({
        token: "dummy-token",
        password: newPassword,
      });

      expectAppError(response, 400, "BAD_REQUEST");
    });
  });

  describe("validation", () => {
    it("returns 422 when token is missing", async () => {
      await seedUserWithResetToken();

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        password: newPassword,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when token is null", async () => {
      await seedUserWithResetToken();

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: null,
        password: newPassword,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when token is empty", async () => {
      await seedUserWithResetToken();

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: "",
        password: newPassword,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when token is not a string", async () => {
      await seedUserWithResetToken();

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: 123456789,
        password: newPassword,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });

  describe("password policy", () => {
    it("returns 422 when password is missing", async () => {
      const { tokenPlaintext } = await seedUserWithResetToken();

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: tokenPlaintext,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it.each([
      {
        test: "returns 422 when password is not a string",
        password: 1234567890,
      },
      {
        test: "returns 422 when password is empty",
        password: "",
      },
      {
        test: "returns 422 when password is shorter than 8 characters",
        password: "Abcde1!",
      },
      {
        test: "returns 422 when password is longer than 128 characters",
        password: oldPassword.repeat(10),
      },
      {
        test: "returns 422 when password does not contain a lowercase letter",
        password: "ABCDEFGHIJ",
      },
      {
        test: "returns 422 when password does not contain an uppercase letter",
        password: "abcdefghij",
      },
      {
        test: "returns 422 when password does not contain a number",
        password: "AbcDefGhiJ",
      },
    ])("$test", async ({ password }) => {
      const { tokenPlaintext } = await seedUserWithResetToken();

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: tokenPlaintext,
        password,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });

  describe("business rules", () => {
    it("does not allow the same reset token to be used twice", async () => {
      const { user, tokenPlaintext } = await seedUserWithResetToken();

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: tokenPlaintext,
        password: newPassword,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expectUserDetailDto(payload, {
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
        status: UserStatus.ACTIVE,
        roleNames: [{ name: "USER_VIEWER" }],
        resetTokenExpiresAt: null,
      });

      expect(payload.resetTokenExpiresAt).toBeNull();

      await expectPersistedUser({
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
      });

      const secondResponse = await api.post(endpoint).send({
        token: tokenPlaintext,
        password: "AnotherStrongPassword123!",
      });

      expectAppError(secondResponse, 422, "VALIDATION_ERROR");
    });

    it.each([
      {
        test: "returns 422 when user status is NEW",
        status: UserStatus.NEW,
      },
      {
        test: "returns 422 when user status is INVITED",
        status: UserStatus.INVITED,
      },
      {
        test: "returns 422 when user status is INACTIVE",
        status: UserStatus.INACTIVE,
      },
    ])("$test", async ({ status }) => {
      const { tokenPlaintext } = await seedUserWithResetToken({
        status,
      });

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        token: tokenPlaintext,
        password: newPassword,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });
});
