/**
 * File: src/tests/helpers/seed/seedUser.js
 */

import { userFactory } from "../factories/userFactory.js";

/**
 * @param {Object} params
 * @param {import("@prisma/client").PrismaClient} params.prisma
 * @param {{ hash: (plain: string) => Promise<string> }} params.passwordService
 * @param {Object} [params.payload]
 */
export async function seedUser({ prisma, passwordService, payload = {} }) {
  const data = userFactory(payload);

  const passwordHash = data.passwordPlain
    ? await passwordService.hash(data.passwordPlain)
    : null;

  const user = await prisma.user.create({
    data: {
      tenantId: data.tenantId,
      email: data.email,
      status: data.status,
      passwordHash,
    },
  });

  if (Array.isArray(data.roleNames) && data.roleNames.length > 0) {
    const roles = await prisma.role.findMany({
      where: {
        tenantId: data.tenantId,
        name: { in: data.roleNames },
      },
    });

    for (const role of roles) {
      await prisma.userRole.create({
        data: {
          tenantId: data.tenantId,
          userId: user.id,
          roleId: role.id,
        },
      });
    }
  }

  return user;
}