import { seedTenant } from "../seed/seedTenant.js";
import { seedRole } from "../seed/seedRole.js";
import { seedUser } from "../seed/seedUser.js";
import { loginAs } from "../auth/loginAs.js";
import { createAuthenticatedApiClient } from "../http/authenticatedApiClient.js";

export async function setupBaseTenantWithSuperAdmin({
  app,
  prisma,
  container,
}) {
  const tenant = await seedTenant({
    prisma,
    payload: {
      slug: "base",
      name: "KeepTrack Online",
      type: "BASE",
    },
  });

  await seedRole({
    prisma,
    payload: {
      tenantId: tenant.id,
      name: "SUPER_ADMIN",
    },
  });

  const superAdminUser = await seedUser({
    prisma,
    passwordService: container.services.passwordService,
    payload: {
      tenantId: tenant.id,
      email: "super_admin@keeptrackonline.nl",
      status: "ACTIVE",
      passwordPlain: "Test123!123",
      roleNames: ["SUPER_ADMIN"],
    },
  });

  const { cookie } = await loginAs({
    app,
    tenantSlug: tenant.slug,
    email: superAdminUser.email,
    password: "Test123!123",
  });

  const api = createAuthenticatedApiClient(app, {
    tenantSlug: tenant.slug,
    cookie,
  });

  return {
    tenant,
    superAdminUser,
    cookie,
    api,
  };
}