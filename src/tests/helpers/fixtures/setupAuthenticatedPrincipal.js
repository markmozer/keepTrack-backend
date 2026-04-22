/**
 * File: src/tests/helpers/fixtures/setupAuthenticatedPrincipal.js
 */

import { seedRole } from "../seed/seedRole.js";
import { seedUser } from "../seed/seedUser.js";
import { loginAs } from "../auth/loginAs.js";
import { createAuthenticatedApiClient } from "../http/authenticatedApiClient.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";

/**
 * @param {Object} params
 * @param {import("express").Express} params.app
 * @param {import("@prisma/client").PrismaClient} params.prisma
 * @param {import("../../../app/buildContainer.js").Container} params.container
 * @param {{ id: string, slug: string }} params.tenant
 * @param {string} params.email
 * @param {string} [params.password]
 * @param {{name?: string, validFrom?: Date | null, validTo?: Date | null}[]} [params.userRoles]
 * @returns {Promise<{ user: unknown, cookie: string[], api: ReturnType<typeof createAuthenticatedApiClient> }>}
 */
export async function setupAuthenticatedPrincipal({
  app,
  prisma,
  container,
  tenant,
  email,
  password = "Test123!123",
  userRoles = [],
}) {

  for (const ur of userRoles) {
    await seedRole({
      prisma,
      payload: {
        tenantId: tenant.id,
        name: ur.name,
      },
    });
  }


  const user = await seedUser({
    prisma,
    container,
    defaultTenant: tenant,
    userRoles,
    status: UserStatus.ACTIVE,
    passwordPlain: password,
    email,
  });

  const { cookie } = await loginAs({
    app,
    tenantSlug: tenant.slug,
    email,
    password,
  });

  const api = createAuthenticatedApiClient(app, {
    tenantSlug: tenant.slug,
    cookie,
  });

  return { user, cookie, api };
}