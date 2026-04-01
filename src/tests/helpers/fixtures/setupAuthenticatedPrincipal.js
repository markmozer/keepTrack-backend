/**
 * File: src/tests/helpers/fixtures/setupAuthenticatedPrincipal.js
 */

import { seedRole } from "../seed/seedRole.js";
import { seedUser } from "../seed/seedUser.js";
import { loginAs } from "../auth/loginAs.js";
import { createAuthenticatedApiClient } from "../http/authenticatedApiClient.js";

/**
 * @param {Object} params
 * @param {import("express").Express} params.app
 * @param {import("@prisma/client").PrismaClient} params.prisma
 * @param {import("../../../app/buildContainer.js").Container} params.container
 * @param {{ id: string, slug: string }} params.tenant
 * @param {string} params.email
 * @param {string} [params.password]
 * @param {string[]} [params.roleNames]
 * @returns {Promise<{ user: unknown, cookie: string[], api: ReturnType<typeof createAuthenticatedApiClient> }>}
 */
export async function setupAuthenticatedPrincipal({
  app,
  prisma,
  container,
  tenant,
  email,
  password = "Test123!123",
  roleNames = [],
}) {

  for (const roleName of roleNames) {
    await seedRole({
      prisma,
      payload: {
        tenantId: tenant.id,
        name: roleName,
      },
    });
  }

  const user = await seedUser({
    prisma,
    passwordService: container.services.passwordService,
    payload: {
      tenantId: tenant.id,
      email,
      status: "ACTIVE",
      passwordPlain: password,
      roleNames,
    },
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