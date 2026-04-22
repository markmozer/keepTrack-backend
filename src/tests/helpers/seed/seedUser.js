/**
 * File: src/tests/helpers/seed/seedUser.js
 */


import { randomUUID } from "node:crypto";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { seedRole } from "./seedRole.js";
import { seedUserRole } from "./seedUserRole.js";
import { userFactory } from "../factories/userFactory.js";
import { userDetailRowSelect } from "../../../infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js";

/**
 * Seed een user in een tenant, zorg dat gevraagde rollen bestaan en wijs ze toe.
 *
 * @param {Object} params
 * @param {import("@prisma/client").PrismaClient} params.prisma
 * @param {{ services: { passwordService: { hash: (plain: string) => Promise<string> } } }} params.container
 * @param {{ id: string, slug?: string }} params.defaultTenant
 * @param {{ id: string, slug?: string }} [params.tenant]
 * @param {{ name: string, validFrom?: Date | null, validTo?: Date | null }[]} [params.userRoles]
 * @param {string} [params.status]
 * @param {string | null} [params.passwordPlain]
 * @param {string} [params.email]
 * @param {string | null} [params.inviteTokenHash]
 * @param {Date | null} [params.inviteTokenExpiresAt]
 * @param {string | null} [params.resetTokenHash]
 * @param {Date | null} [params.resetTokenExpiresAt]
 */
export async function seedUser({
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

  const data = userFactory({
    tenantId,
    email,
    status,
    passwordPlain,
    inviteTokenHash,
    inviteTokenExpiresAt,
    resetTokenHash,
    resetTokenExpiresAt,
  });

  const passwordHash = data.passwordPlain
    ? await container.services.passwordService.hash(data.passwordPlain)
    : null;

  const user = await prisma.user.create({
    data: {
      tenantId: data.tenantId,
      email: data.email,
      status: data.status,
      passwordHash,
      inviteTokenHash: data.inviteTokenHash,
      inviteTokenExpiresAt: data.inviteTokenExpiresAt,
      resetTokenHash: data.resetTokenHash,
      resetTokenExpiresAt: data.resetTokenExpiresAt,
    },
  });

  for (const ur of userRoles) {
    if (!ur.name) {
      throw new Error("role name is required");
    }

    let role = await prisma.role.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name: ur.name,
        },
      },
    });

    if (!role) {
      role = await seedRole({
        prisma,
        payload: {
          tenantId,
          name: ur.name,
        },
      });
    }

    await seedUserRole({
      prisma,
      payload: {
        tenantId,
        userId: user.id,
        roleId: role.id,
        validFrom: ur.validFrom ?? new Date(),
        validTo: ur.validTo ?? null,
      },
    });
  }

  return prisma.user.findUnique({
    where: { id: user.id },
    select: userDetailRowSelect,
  });
}