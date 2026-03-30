/**
 * File: src/tests/helpers/seedUser.js
 */

import { assertPasswordServicePort } from "../../application/ports/security/PasswordServicePort.js";


/**
 * @typedef {Object} SeedUserPayload
 * @property {string} tenantId
 * @property {string} email
 * @property {string[]} [roleNames]
 * @property {string} [status]
 * @property {string|null} [passwordPlain]
 */

/**
 * @typedef {Object} SeedUserInput
 * @property {import("@prisma/client").PrismaClient} prisma
 * @property {import("../../application/ports/security/PasswordServicePort.js").PasswordServicePort} passwordService
 * @property {SeedUserPayload} payload
 */

/**
 * Seeds a user and optionally assigns roles by role name.
 *
 * Assumptions:
 * - roles already exist in DB
 * - userRole is the join table between user and role
 *
 * @param {SeedUserInput} input
 */
export async function seedUser(input) {

  assertPasswordServicePort(input.passwordService);

  const passwordHash = await input.passwordService.hash(input.payload.passwordPlain);

  const user = await input.prisma.user.create({
    data: {
      tenantId: input.payload.tenantId,
      email: input.payload.email,
      status: input.payload.status ? input.payload.status : "ACTIVE",
      passwordHash,
    },
  });

  if (input.payload.roleNames.length > 0) {
    const roles = await input.prisma.role.findMany({
      where: {
        name: {
          in: input.payload.roleNames,
        },
      },
    });

    const foundRoleNames = new Set(roles.map((r) => r.name));
    const missingRoleNames = input.payload.roleNames.filter((name) => !foundRoleNames.has(name));

    if (missingRoleNames.length > 0) {
      throw new Error(
        `seedUser: roles not found: ${missingRoleNames.join(", ")}`
      );
    }

    await input.prisma.userRole.createMany({
      data: roles.map((role) => ({
        tenantId: user.tenantId,
        userId: user.id,
        roleId: role.id,
      })),
    });
  }

  return user;
}