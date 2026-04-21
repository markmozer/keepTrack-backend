/**
 * File: src/tests/integration/users/getUsers.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectUserList } from "../../helpers/assertions/expectUserList.js";
import { UserStatus } from "@prisma/client";
import { toUserDto } from "../../../application/users/user.mappers.js";
import { setupTestUser } from "../../helpers/fixtures/setupTestUser.js";

describe("GetUsers (integration) GET /api/users", () => {
  const endpoint = "/api/users";
  const strongPassword = "Strong123!123";

  let app;
  let container;
  let primaryTenant;
  let users = [];

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

    const seedUsers = [
      {
        email: "user_beta@example.com",
        userRoles: [{name: "USER_VIEWER"}],
        status: UserStatus.INVITED,
      },
      {
        email: "user_alpha@example.com",
        userRoles: [{name: "USER_ADMIN"},{name: "CONTRACT_ADMIN"}],
        status: UserStatus.NEW,
      },
      {
        email: "user_delta@example.com",
        userRoles: [{name: "USER_ADMIN"},{name: "CONTRACT_ADMIN"}],
        status: UserStatus.INACTIVE,
      },
      {
        email: "user_charlie@example.com",
        userRoles: [{name: "USER_VIEWER"}],
        status: UserStatus.ACTIVE,
      },
    ];

    for (const su of seedUsers) {
      let user = await setupTestUser({
        prisma: container.prisma,
        container,
        defaultTenant: primaryTenant,
        email: su.email,
        userRoles: su.userRoles,
        status: su.status,
      });
      users.push(user);
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
      tenant: primaryTenant,
      email: "user_viewer@example.com",
      roleNames: ["USER_VIEWER"],
    });
  }

  async function setupContractAdmin() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: primaryTenant,
      email: "contract_admin@example.com",
      roleNames: ["CONTRACT_ADMIN"],
    });
  }
  describe("authorization", () => {
    it("returns 200 when user has USER_VIEWER role", async () => {
      const { api } = await setupUserViewer();

      const response = await api.get("/api/users");

      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
    });

    it("returns 403 when user has CONTRACT_ADMIN role", async () => {
      const { api } = await setupContractAdmin();

      const response = await api.get(endpoint);

      expectAppError(response, 403, "FORBIDDEN");
    });

    it("returns 401 when principal is missing", async () => {
      const api = createApiClient(app, primaryTenant.slug);
      const response = await api.get(endpoint);
      expectAppError(response, 401, "UNAUTHORIZED");
    });
  });

  describe("tenant resolution", () => {
    it("returns 400 when X-Tenant-Slug header is missing", async () => {
      const api = createApiClient(app, undefined);

      const response = await api.get(endpoint);

      expectAppError(response, 400, "BAD_REQUEST");
    });

    it("returns 400 when X-Tenant-Slug header is empty", async () => {
      const api = createApiClient(app, "");

      const response = await api.get(endpoint);

      expectAppError(response, 400, "BAD_REQUEST");
    });
  });

  describe("default behavior", () => {
    it("returns all users with default pagination", async () => {
      const { user, api } = await setupUserViewer();
      const response = await api.get(endpoint);
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.items).toHaveLength(5);
      expect(payload.totalItems).toBe(5);
      expect(payload.items.map((item) => item.email)).toEqual(
        expect.arrayContaining([
          "user_alpha@example.com",
          "user_beta@example.com",
          "user_charlie@example.com",
          "user_delta@example.com",
          "user_viewer@example.com",
        ]),
      );
    });
  });

  describe("filtering", () => {
    it("filters users by email", async () => {
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint).query({
        email: "ha",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.totalItems).toBe(2);
      expect(payload.items).toHaveLength(2);
      expect(payload.items.map((item) => item.email)).toEqual(
        expect.arrayContaining([
          "user_alpha@example.com",
          "user_charlie@example.com",
        ]),
      );
    });
    it("filters users by status", async () => {
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint).query({
        status: UserStatus.ACTIVE,
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.totalItems).toBe(2);
      expect(payload.items).toHaveLength(2);
      expect(payload.items.map((item) => item.email)).toEqual(
        expect.arrayContaining([
          "user_charlie@example.com",
          "user_viewer@example.com",
        ]),
      );
    });
    it("filters users by roleName", async () => {
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint).query({
        roleName: "USER_ADMIN",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.totalItems).toBe(2);
      expect(payload.items).toHaveLength(2);
      expect(payload.items.map((item) => item.email)).toEqual(
        expect.arrayContaining([
          "user_alpha@example.com",
          "user_delta@example.com",
        ]),
      );
    });
  });

  describe("sorting", () => {
    it("sorts users by email ascending", async () => {
      const { user, api } = await setupUserViewer();
      users.push(user);
      const response = await api.get(endpoint).query({
        sortField: "email",
        sortDirection: "asc",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.items.map((item) => item.email)).toEqual([
        "user_alpha@example.com",
        "user_beta@example.com",
        "user_charlie@example.com",
        "user_delta@example.com",
        "user_viewer@example.com",
      ]);
    });

    it("sorts users by email descending", async () => {
      const { user, api } = await setupUserViewer();
      users.push(user);
      const response = await api.get(endpoint).query({
        sortField: "email",
        sortDirection: "desc",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.items.map((item) => item.email)).toEqual([
        "user_viewer@example.com",
        "user_delta@example.com",
        "user_charlie@example.com",
        "user_beta@example.com",
        "user_alpha@example.com",
      ]);
    });
    it("sorts users by status ascending", async () => {
      const { user, api } = await setupUserViewer();
      users.push(user);
      const response = await api.get(endpoint).query({
        sortField: "status",
        sortDirection: "asc",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.items.map((item) => item.email)).toEqual([
        "user_alpha@example.com",
        "user_beta@example.com",
        "user_charlie@example.com",
        "user_viewer@example.com",
        "user_delta@example.com",
      ]);
    });

    it("sorts users by status descending", async () => {
      const { user, api } = await setupUserViewer();
      users.push(user);
      const response = await api.get(endpoint).query({
        sortField: "status",
        sortDirection: "desc",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.items.map((item) => item.email)).toEqual([
        "user_delta@example.com",
        "user_charlie@example.com",
        "user_viewer@example.com",
        "user_beta@example.com",
        "user_alpha@example.com",
      ]);
    });
    it("sorts users by createdAt ascending", async () => {
      const { user, api } = await setupUserViewer();
      users.push(user);
      const response = await api.get(endpoint).query({
        sortField: "createdAt",
        sortDirection: "asc",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.items.map((item) => item.email)).toEqual([
        "user_beta@example.com",
        "user_alpha@example.com",
        "user_delta@example.com",
        "user_charlie@example.com",
        "user_viewer@example.com",
      ]);
    });

    it("sorts users by createdAt descending", async () => {
      const { user, api } = await setupUserViewer();
      users.push(user);
      const response = await api.get(endpoint).query({
        sortField: "createdAt",
        sortDirection: "desc",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.items.map((item) => item.email)).toEqual([
        "user_viewer@example.com",
        "user_charlie@example.com",
        "user_delta@example.com",
        "user_alpha@example.com",
        "user_beta@example.com",
      ]);
    });
  });

  describe("pagination", () => {
    it("returns the first page with the requested page size", async () => {
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint).query({
        page: 1,
        pageSize: 2,
        sortField: "email",
        sortDirection: "asc",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 2 });
      expect(payload.totalItems).toBe(5);
      expect(payload.items).toHaveLength(2);
      expect(payload.items.map((item) => item.email)).toEqual([
        "user_alpha@example.com",
        "user_beta@example.com",
      ]);
    });

    it("returns the second page with the requested page size", async () => {
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint).query({
        page: 2,
        pageSize: 2,
        sortField: "email",
        sortDirection: "asc",
      });
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 2, pageSize: 2 });
      expect(payload.totalItems).toBe(5);
      expect(payload.items).toHaveLength(2);
      expect(payload.items.map((item) => item.email)).toEqual([
        "user_charlie@example.com",
        "user_delta@example.com",
      ]);
    });
  });

  describe("validation", () => {
    it("returns 422 when page is invalid", async () => {
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint).query({
        page: 0,
      });
      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when pageSize is invalid", async () => {
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint).query({
        pageSize: -1,
      });
      expectAppError(response, 422, "VALIDATION_ERROR");
    });

    it("returns 422 when sort direction is invalid", async () => {
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint).query({
        sortField: "name",
        sortDirection: "sideways",
      });
      expectAppError(response, 422, "VALIDATION_ERROR");
    });
  });
  describe("tenant isolation", () => {
    it("returns only users from the principal tenant", async () => {
      const otherTenant = await seedTenant({
        prisma: container.prisma,
        payload: {
          name: "Other Tenant",
          slug: "other-tenant",
          type: "CLIENT",
          status: "ACTIVE",
        },
      });

      await setupTestUser({
        prisma: container.prisma,
        container,
        defaultTenant: primaryTenant,
        tenant: otherTenant,
        email: "other_user@example.com",
        userRoles: [{name: "USER_VIEWER"}],
        status: UserStatus.ACTIVE,
      });
      const { api } = await setupUserViewer();
      const response = await api.get(endpoint);
      const payload = expectAppSuccessWithPayload(response, { status: 200 });
      expectUserList(payload, { page: 1, pageSize: 25 });
      expect(payload.items.map((item) => item.email)).not.toContain(
        "other_user@example.com",
      );
    });
  });
});
