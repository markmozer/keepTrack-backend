/**
 * File: src/tests/helpers/seed/seedUserRole.js
 */

import { userRoleFactory } from "../factories/userRoleFactory";

export async function seedUserRole({ prisma, payload }) {
  const data = userRoleFactory(payload);

  const userRole = await prisma.userRole.create({
    data: {
      validFrom: data.validFrom,
      validTo: data.validTo,
      tenant: {
        connect: { id: data.tenantId },
      },
      user: {
        connect: { id: data.userId },
      },
      role: {
        connect: { id: data.roleId },
      },
    },
  });

  return userRole;
}
