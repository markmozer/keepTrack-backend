/**
 * File: src/tests/helpers/fixtures/setupTestUser.js
 */

import { randomUUID } from "node:crypto";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { seedRole } from "../seed/seedRole.js";
import { seedUser } from "../seed/seedUser.js";
import { seedUserRole } from "../seed/seedUserRole.js";
import { userDetailRowSelect } from "../../../infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js";

/**
 * Seed een user in een tenant, zorg dat gevraagde rollen bestaan en wijs ze toe.
 *
 * @param {Object} params
 * @param {import("@prisma/client").PrismaClient} params.prisma
 * @param {{ services: { passwordService: { hash: (plain: string) => Promise<string> } } }} params.container
 * @param {{ id: string, slug?: string }} params.defaultTenant
 * @param {{ id: string, slug?: string }} [params.tenant]
 * @param {{ name: string, validFrom: Date | null, validTo: Date | null}[]} [params.userRoles]
 * @param {string} [params.status]
 * @param {string | null} [params.passwordPlain]
 * @param {string} [params.email]
 * @param {string | null} [params.inviteTokenHash]
 * @param {Date | null} [params.inviteTokenExpiresAt]
 * @param {string | null} [params.resetTokenHash]
 * @param {Date | null} [params.resetTokenExpiresAt]
 */

export async function setupTestUser({
  prisma,
  container,
  defaultTenant,
  tenant = defaultTenant,
  userRoles = [],
  status = UserStatus.NEW,
  passwordPlain = null,
  email = `user-${randomUUID().slice(0, 8)}@example.com`,
  inviteTokenHash = null,
  inviteTokenExpiresAt = null,
  resetTokenHash = null,
  resetTokenExpiresAt = null,
}) {
  const tenantId = tenant.id;

  const user = await seedUser({
    prisma,
    passwordService: container.services.passwordService,
    payload: {
      tenantId,
      email,
      status,
      passwordPlain,
      roleNames: [],
      inviteTokenHash,
      inviteTokenExpiresAt,
      resetTokenHash,
      resetTokenExpiresAt,
    },
  });

  let role;

  if (userRoles.length > 0) {
    for (const ur of userRoles) {
      if (!ur.name) throw new Error("role name is required");
      const existingRole = await prisma.role.findUnique({
        where: { tenantId_name: { tenantId, name: ur.name } },
      });
      if (existingRole) {
        role = existingRole;
      } else {
        role = await seedRole({
          prisma,
          payload: {
            tenantId,
            name: ur.name,
          },
        });
      }
      const userRole = await seedUserRole({
        prisma,
        payload: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: role.id,
          validFrom: ur.validFrom ? ur.validFrom : new Date(),
          validTo: ur.validTo ? ur.validTo : null,
        },
      });
    }
  }

  const result = await prisma.user.findUnique({
    where: { id: user.id },
    select: userDetailRowSelect
  });



  return result;
}
