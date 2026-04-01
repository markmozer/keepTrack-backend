/**
 * File: src/tests/helpers/seed/seedUserRole.js
 */

export async function seedUserRole({ prisma, payload }) {
  return prisma.userRole.create({
    data: {
      userId: payload.userId,
      roleId: payload.roleId,
    },
  });
}