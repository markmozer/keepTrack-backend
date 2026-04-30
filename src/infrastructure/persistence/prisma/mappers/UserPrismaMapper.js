/**
 * File: src/infrastructure/persistence/prisma/mappers/UserPrismaMapper.js
 */

import { User } from "../../../../domain/users/User.js";
import { UserRole } from "../../../../domain/users/UserRole.js";

/**
 * 
 * @param {import("../../../../application/ports/users/user.types.js").publicUserRow} row 
 * @returns {User}
 */
export function toPublicUserDomain(row) {
  return new User({
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    inviteTokenExpiresAt: row.inviteTokenExpiresAt,
    resetTokenExpiresAt: row.resetTokenExpiresAt,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userRoles: row.userRoles?.map(toUserRoleDomain) ?? [],
  });
}

/**
 * 
 * @param {import("../../../../application/ports/users/user.types.js").publicUserRow} row 
 * @returns {User | null}
 */
export function toPublicUserDomainOrNull(row) {
  if (!row) return null;

  return new User({
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    inviteTokenExpiresAt: row.inviteTokenExpiresAt,
    resetTokenExpiresAt: row.resetTokenExpiresAt,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userRoles: row.userRoles?.map(toUserRoleDomain) ?? [],
  });
}

/**
 * 
 * @param {import("../../../../application/ports/users/user.types.js").UserRoleRow} row 
 * @returns {UserRole}
 */
function toUserRoleDomain(row) {
  return new UserRole({
    id: row.id,
    tenantId: row.tenantId,
    userId: row.id,
    roleId: row.roleId,
    roleName: row.role?.name,
    validFrom: row.validFrom,
    validTo: row.validTo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}