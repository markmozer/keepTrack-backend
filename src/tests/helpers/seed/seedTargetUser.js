/**
 * File: src/tests/helpers/seed/seedTargetUser.js
 */
import { randomUUID } from "node:crypto";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { seedRole } from "./seedRole.js";
import { seedUser } from "./seedUser.js";

/**
 * Seed een user in een tenant, zorg dat gevraagde rollen bestaan en wijs ze toe.
 *
 * @param {Object} params
 * @param {import("@prisma/client").PrismaClient} params.prisma
 * @param {{ services: { passwordService: { hash: (plain: string) => Promise<string> } } }} params.container
 * @param {{ id: string, slug?: string }} params.defaultTenant
 * @param {{ id: string, slug?: string }} [params.tenant]
 * @param {string[]} [params.roleNames]
 * @param {string} [params.status]
 * @param {string | null} [params.passwordPlain]
 * @param {string} [params.email]
 * @param {string | null} [params.inviteTokenHash]
 * @param {Date | null} [params.inviteTokenExpiresAt]
 * @param {string | null} [params.resetTokenHash]
 * @param {Date | null} [params.resetTokenExpiresAt]
 */

export async function seedTargetUser({
  prisma,
  container,
  defaultTenant,
  tenant = defaultTenant,
  roleNames = [],
  status = UserStatus.NEW,
  passwordPlain = null,
  email = `user-${randomUUID().slice(0, 8)}@example.com`,
  inviteTokenHash = null,
  inviteTokenExpiresAt = null,
  resetTokenHash = null,
  resetTokenExpiresAt = null,
}) {
  const tenantId = tenant.id;

  if (roleNames.length > 0) {
    const existingRoles = await prisma.role.findMany({
      where: {
        tenantId,
        name: {
          in: roleNames,
        },
      },
      select: {
        name: true,
      },
    });

    const existingRoleNames = new Set(existingRoles.map((role) => role.name));

    for (const roleName of roleNames) {
      if (!existingRoleNames.has(roleName)) {
        await seedRole({
          prisma,
          payload: {
            tenantId,
            name: roleName,
          },
        });
      }
    }
  }

  return seedUser({
    prisma,
    passwordService: container.services.passwordService,
    payload: {
      tenantId,
      email,
      status,
      passwordPlain,
      roleNames,
      inviteTokenHash,
      inviteTokenExpiresAt,
      resetTokenHash,
      resetTokenExpiresAt,
    },
  });
}