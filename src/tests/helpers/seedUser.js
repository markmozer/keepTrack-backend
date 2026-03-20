/**
 * File: src/tests/helpers/seedUser.js
 */

import { getPrisma } from "../../infrastructure/persistence/prisma/prismaClient.js";
import { PasswordHasherBcrypt } from "../../infrastructure/services/security/PasswordHasherBcrypt.js";
import { assertPasswordServicePort } from "../../application/ports/security/PasswordServicePort.js";

const prisma = getPrisma();

/**
 * @typedef {Object} SeedUserInput
 * @property {string} tenantId
 * @property {string} email
 * @property {string[]} [roleNames]
 * @property {string} [status]
 * @property {string|null} [passwordPlain]
 * @property {string|null} [firstName]
 * @property {string|null} [lastName]
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
export async function seedUser({
  tenantId,
  email,
  roleNames = [],
  status = "ACTIVE",
  passwordPlain,
}) {

  const passwordService = new PasswordHasherBcrypt();
  assertPasswordServicePort(passwordService);

  const passwordHash = await passwordService.hash(passwordPlain);

  const user = await prisma.user.create({
    data: {
      tenantId,
      email,
      status,
      passwordHash,
    },
  });

  if (roleNames.length > 0) {
    const roles = await prisma.role.findMany({
      where: {
        name: {
          in: roleNames,
        },
      },
    });

    const foundRoleNames = new Set(roles.map((r) => r.name));
    const missingRoleNames = roleNames.filter((name) => !foundRoleNames.has(name));

    if (missingRoleNames.length > 0) {
      throw new Error(
        `seedUser: roles not found: ${missingRoleNames.join(", ")}`
      );
    }

    await prisma.userRole.createMany({
      data: roles.map((role) => ({
        tenantId: tenantId,
        userId: user.id,
        roleId: role.id,
      })),
    });
  }

  return user;
}