/**
 * File: src/tests/integration/users/requestPasswordReset.int.test.js
 */
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { seedTargetUser } from "../../helpers/seed/seedTargetUser.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";

describe("ForgotPassword (integration) POST /api/users/forgot-password", () => {
  const endpoint = "/api/users/forgot-password";
  const strongPassword = "Strong123!123";
  const standardMessage =
    "Als dit email adres bestaat, ontvangt u een email met een password reset link.";

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

  async function seedResetCandidate({
    roleNames = ["USER_VIEWER"],
    passwordPlain = strongPassword,
    status = UserStatus.ACTIVE,
    tenant,
  } = {}) {
    const user = await seedTargetUser({
      prisma: container.prisma,
      container,
      defaultTenant: primaryTenant,
      tenant,
      status,
      passwordPlain,
      roleNames,
    });

    return { user };
  }

  async function expectPersistedUserWithResetToken({ tenantId, id, email }) {
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
    expect(row?.status).toBe(UserStatus.ACTIVE);
    expect(row?.inviteTokenHash).toBeNull();
    expect(row?.inviteTokenExpiresAt).toBeNull();
    expect(typeof row?.resetTokenHash).toBe("string");
    expect(row?.resetTokenHash.length).toBeGreaterThan(10);
    expect(row?.resetTokenExpiresAt).toBeInstanceOf(Date);
    expect(row?.createdAt).toBeInstanceOf(Date);
    expect(row?.updatedAt).toBeInstanceOf(Date);
  }

  describe("core flow", () => {
    it("when email exists, sets reset pwd state and returns 200 with standard message", async () => {
      const { user } = await seedResetCandidate();

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        email: user.email,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expect(payload.message).toBe(standardMessage);

      await expectPersistedUserWithResetToken({
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
      });

      const row = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: user.tenantId,
            email: user.email,
          },
        },
      });

      const expectedExpiresAt =
        row.updatedAt.getTime() +
        container.appConfig.auth.resetTtlMinutes * 60 * 1000;
      const actualExpiresAt = row.resetTokenExpiresAt.getTime();

      expect(Math.abs(actualExpiresAt - expectedExpiresAt)).toBeLessThan(1000);
    });

    it("when email does not exist, returns 200 with standard message", async () => {
      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        email: "does.not.exist@keeptrack.nl",
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expect(payload.message).toBe(standardMessage);
    });
  });

  describe("tenant resolution", () => {
    it("returns 400 when X-Tenant-Slug header is missing", async () => {
      const api = createApiClient(app, undefined);

      const response = await api.post(endpoint).send({
        email: "dummy@keeptrack.nl",
      });

      expectAppError(response, 400, "BAD_REQUEST");
    });

    it("returns 400 when X-Tenant-Slug header is empty", async () => {
      const api = createApiClient(app, "");

      const response = await api.post(endpoint).send({
        email: "dummy@keeptrack.nl",
      });

      expectAppError(response, 400, "BAD_REQUEST");
    });
  });

  describe("validation", () => {
    it("returns 422 when email is missing", async () => {
      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({});

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when email is null", async () => {
      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        email: null,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when email is empty", async () => {
      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        email: "",
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when email is not a string", async () => {
      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        email: 123456789,
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when email is not a valid email address", async () => {
      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        email: "user$keeptrackonline.nl",
      });

      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });

  describe("business rules", () => {
    it("returns 200 and refreshes reset token when reset is requested again", async () => {
      const { user } = await seedResetCandidate();

      const api = createApiClient(app, primaryTenant.slug);

      const response_one = await api.post(endpoint).send({
        email: user.email,
      });

      const payload_one = expectAppSuccessWithPayload(response_one, {
        status: 200,
      });

      expect(payload_one.message).toBe(standardMessage);

      const rowAfterFirstRequest = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: user.tenantId,
            email: user.email,
          },
        },
      });

      const response_two = await api.post(endpoint).send({
        email: user.email,
      });

      const payload_two = expectAppSuccessWithPayload(response_two, {
        status: 200,
      });

      expect(payload_two.message).toBe(standardMessage);

      const rowAfterSecondRequest = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: user.tenantId,
            email: user.email,
          },
        },
      });

      expect(rowAfterFirstRequest).toBeTruthy();
      expect(rowAfterSecondRequest).toBeTruthy();

      expect(rowAfterSecondRequest.resetTokenHash).not.toBe(
        rowAfterFirstRequest.resetTokenHash,
      );

      expect(rowAfterSecondRequest.resetTokenExpiresAt).toBeInstanceOf(Date);
      expect(rowAfterFirstRequest.resetTokenExpiresAt).toBeInstanceOf(Date);
      expect(rowAfterSecondRequest.resetTokenExpiresAt.getTime()).not.toBe(
        rowAfterFirstRequest.resetTokenExpiresAt.getTime(),
      );
    });
    it.each([
      {
        test: "returns 200 with standard message when user status is NEW",
        status: UserStatus.NEW,
      },
      {
        test: "returns 200 with standard message when user status is INVITED",
        status: UserStatus.INVITED,
      },
      {
        test: "returns 200 with standard message when user status is INACTIVE",
        status: UserStatus.INACTIVE,
      },
    ])("$test", async ({ status }) => {
      const { user } = await seedResetCandidate({ status });

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        email: user.email,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expect(payload.message).toBe(standardMessage);

      const row = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: user.tenantId,
            email: user.email,
          },
        },
      });

      expect(row).toBeTruthy();
      expect(row?.id).toBe(user.id);
      expect(row?.tenantId).toBe(user.tenantId);
      expect(row?.email).toBe(user.email);
      expect(row?.status).toBe(status);
      expect(row?.resetTokenHash).toBeNull();
      expect(row?.resetTokenExpiresAt).toBeNull();
    });
  });

  describe("tenant isolation", () => {
    it("returns 200 with standard message when target user belongs to another tenant", async () => {
      const secondaryTenant = await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Secondary Tenant",
          slug: "secondary-tenant",
          type: "CLIENT",
        },
      });

      const { user } = await seedResetCandidate({
        tenant: secondaryTenant,
      });

      const api = createApiClient(app, primaryTenant.slug);

      const response = await api.post(endpoint).send({
        email: user.email,
      });

      const payload = expectAppSuccessWithPayload(response, {
        status: 200,
      });

      expect(payload.message).toBe(standardMessage);

      const row = await container.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: user.tenantId,
            email: user.email,
          },
        },
      });

      expect(row).toBeTruthy();
      expect(row?.id).toBe(user.id);
      expect(row?.tenantId).toBe(secondaryTenant.id);
      expect(row?.email).toBe(user.email);
      expect(row?.status).toBe(UserStatus.ACTIVE);
      expect(row?.resetTokenHash).toBeNull();
      expect(row?.resetTokenExpiresAt).toBeNull();
    });
  });
});
