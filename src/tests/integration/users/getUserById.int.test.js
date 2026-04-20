/**
 * File: src/tests/integration/users/getUserById.int.test.js
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";
import { seedTenant } from "../../helpers/seed/seedTenant.js";
import { setupTestUser } from "../../helpers/fixtures/setupTestUser.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { createApiClient } from "../../helpers/http/apiClient.js";
import { setupAuthenticatedPrincipal } from "../../helpers/fixtures/setupAuthenticatedPrincipal.js";
import { expectAppSuccessWithPayload } from "../../helpers/assertions/expectAppSuccess.js";
import { expectAppError } from "../../helpers/assertions/expectAppError.js";
import { expectUserAdminDto } from "../../helpers/assertions/expectUserAdminDto.js";

describe("GetUserById (integration) POST /api/users/:userId", () => {
  const endpoint = "/api/users";
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

  async function setupUserAdmin() {
    return setupAuthenticatedPrincipal({
      app,
      prisma: container.prisma,
      container,
      tenant: primaryTenant,
      email: "user_viewer@example.com",
      roleNames: ["USER_VIEWER"],
    });
  }

  describe("authorization", () => {
    it("returns 200 when pricipal is authorized", async () => {
      
      const now = container.services.clockService.now();
      const nowMinusFourteen = container.services.clockService.addDays(now, -14);
      const nowPlusFourteen =  container.services.clockService.addDays(now, 14);
      const { user } = await setupTestUser({
        prisma: container.prisma,
        container,
        defaultTenant: primaryTenant,
        userRoles: [{name: "USER_ADMIN", validFrom: nowMinusFourteen }, {name: "USER_VIEWER"}, {name: "USER_EDITOR", validFrom: nowPlusFourteen}],
        status: UserStatus.NEW,
        passwordPlain: strongPassword,
      });


    //   const { api } = await setupUserAdmin();

    //   const response = await api.get(`${endpoint}/${user.id}`);

    //   const payload = expectAppSuccessWithPayload(response, {
    //     status: 200,
    //   });


    });

   });

});
