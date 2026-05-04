/**
 * File: src/infrastructure/persistence/prisma/repositories/UserRoleRepositoryPrisma.js
 */

import { toUserAggregateRole } from "../mappers/UserPrismaMapper.js"

/**
 * @typedef {import("../../../../application/ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} UserRoleRepositoryPort
 * @typedef {import("../../../../domain/users/UserRole.js").UserRole} UserRole
 */

const userRoleRowSelect = {
  id: true,
  tenantId: true,
  userId: true,
  roleId: true,
  validFrom: true,
  validTo: true,
  role: {
    select: {
      name: true,
    },
  },
};

const userRoleAdminRowSelect = {
  ...userRoleRowSelect,
  createdAt: true,
  updatedAt: true,
};

/**
 * @implements {UserRoleRepositoryPort}
 */
export class UserRoleRepositoryPrisma {
  /**
   * @param {{ prisma: any }} deps
   */
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  
  /**
   * @param {UserRole} userRole
   * @returns {Promise<UserRole>}
   */
  async create(userRole) {
    const row = await this.prisma.userRole.create({
      data: {
        tenantId: userRole.tenantId,
        userId: userRole.userId,
        roleId: userRole.roleId,
        validFrom: userRole.validFrom,
        validTo: userRole.validTo,
        createdAt: userRole.createdAt ? userRole.createdAt : undefined,
        updatedAt: userRole.updatedAt ? userRole.updatedAt : undefined,
      },
      select: userRoleAdminRowSelect,
    });

    return toUserAggregateRole(row);
  }
}
