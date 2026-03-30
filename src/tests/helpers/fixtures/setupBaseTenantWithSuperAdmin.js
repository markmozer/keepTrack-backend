/**
 * File: src/tests/helpers/fixtures/setupBaseTenantWithSuperAdmin.js
 */

import { seedTenant } from "../seedTenant.js";
import { seedRole } from "../seedRole.js";
import { seedUser } from "../seedUser.js";
import { loginAs } from "../auth/loginAs.js";
import { createAuthenticatedApiClient } from "../http/authenticatedApiClient.js";

/**
 * @param {Object} params
 * @param {import("express").Express} params.app
 * @param {import("@prisma/client").PrismaClient} params.prisma
 * @param {import("../../../app/buildContainer.js").Container} params.container
 */
export async function setupBaseTenantWithSuperAdmin({
  app,
  prisma,
  container,
}) {
  // 1. Seed base tenant
  const tenant = await seedTenant({
    prisma,
    payload: {
      slug: "base",
      name: "KeepTrack Online",
      type: "BASE",
    },
  });

  // 2. Seed SUPER_ADMIN role
  await seedRole({
    prisma,
    payload: {
      tenantId: tenant.id,
      name: "SUPER_ADMIN",
    },
  });

  // 3. Seed SUPER_ADMIN user
  const superAdminUser = await seedUser({
    prisma,
    passwordService: container.services.passwordService,
    payload: {
      tenantId: tenant.id,
      email: "super_admin@keeptrackonline.nl",
      roleNames: ["SUPER_ADMIN"],
      status: "ACTIVE",
      passwordPlain: "Test123!123",
    },
  });

  // 4. Login
  const { cookie } = await loginAs({
    app,
    tenantSlug: tenant.slug,
    email: superAdminUser.email,
    password: "Test123!123",
  });

  // 5. Authenticated API client
  const api = createAuthenticatedApiClient(app, {
    tenantSlug: tenant.slug,
    cookie,
  });

  return {
    tenant,
    superAdminUser,
    api,
    cookie,
  };
}