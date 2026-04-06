/**
 * File: src/tests/helpers/fixtures/setupLoginCanditate.js
 */

import { seedRole } from "../seed/seedRole.js";
import { seedUser } from "../seed/seedUser.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";

export async function setupLoginCandidate({
  prisma,
  container,
  tenant,
  email,
  hasPassword = true,
  password = "Test123!123",
  status = UserStatus.ACTIVE,
  roleNames = [],
}) {
  
  // roles
  for (const roleName of roleNames) {
    await seedRole({
      prisma,
      payload: {
        tenantId: tenant.id,
        name: roleName,
      },
    });
  }

  const passwordPlain = hasPassword ? password : null;

  // user
  const user = await seedUser({
    prisma,
    passwordService: container.services.passwordService,
    payload: {
      tenantId: tenant.id,
      email,
      status,
      passwordPlain,
      roleNames,
    },
  });

  return {
    user,
    password: passwordPlain,
  };
}
