/**
 * File: src/tests/integration/users/getUserById.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { seedUser } from "../../helpers/seed/seedUser.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectUserDetailDto } from "../../helpers/assertions/expectUserDetailDto.js";

describe("GetUserById (integration) POST /api/users/:userId", () => {
  const strongPassword = "Strong123!123";

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

  function tenantEndpoint(slug) {
    return `/api/t/${slug}/users`;
  }

  async function setupUserViewer() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: primaryTenant,
      email: "user_viewer@example.com",
      userRoles: [{ name: "USER_VIEWER" }],
    });
  }

  async function setupContractAdmin() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: primaryTenant,
      email: "contract_admin@example.com",
      userRoles: [{ name: "CONTRACT_ADMIN" }],
    });
  }

  describe("authorization", () => {
    it("returns 200 when pricipal is authorized", async () => {
      const now = container.services.clockService.now();
      const nowMinusFourteen = container.services.clockService.addDays(
        now,
        -14,
      );
      const nowPlusFourteen = container.services.clockService.addDays(now, 14);

      const userRoles = [
        { name: "ADMIN", validTo: new Date(2099, 11, 31) },
        { name: "USER_ADMIN", validFrom: nowMinusFourteen },
        { name: "USER_VIEWER" },
        { name: "USER_EDITOR", validFrom: nowPlusFourteen },
      ];

      const user = await seedUser({
        prisma: container.prisma,
        container,
        defaultTenant: primaryTenant,
        userRoles,
        status: UserStatus.NEW,
        passwordPlain: null,
      });

      const { api } = await setupUserViewer();

      const response = await api.get(`${tenantEndpoint(primaryTenant.slug)}/${user.id}`);

      const payload = expectAppSuccessWithPayload(response, { status: 200 });

      expectUserDetailDto(payload, {
        tenantId: primaryTenant.id,
        id: user.id,
        email: user.email,
        status: UserStatus.NEW,
        userRoles,
      });

      expect(payload.userRoles.length).toBe(userRoles.length);
    });
  });
});
