/**
 * File: src/infrastructure/persistence/prisma/repositories/UserRoleRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} UserRoleRepositoryPort
 * @typedef {import("../../../../application/ports/userRoles/userRole.types.js").UserRoleRow} UserRoleRow
 * @typedef {import("../../../../application/ports/userRoles/userRole.types.js").UserRoleAdminRow} UserRoleAdminRow
 * @typedef {import("../../../../application/ports/userRoles/userRole.types.js").AssignRoleToUserRepoInput} AssignRoleToUserRepoInput
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
   * @param {{tenantId: string, userId: string, roleId: string}} params
   * @returns {Promise<UserRoleAdminRow | null>}
   */
  async findByUserAndRole({ tenantId, userId, roleId }) {
    const row = await this.prisma.userRole.findUnique({
      where: {
        tenantId_userId_roleId: { tenantId, userId, roleId },
      },
      select: userRoleAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {{ tenantId: string, userId: string, atDate: Date }} params
   * @returns {Promise<UserRoleRow[] | null>}
   */
  async findValidByUser({ tenantId, userId, atDate }) {
    return this.prisma.userRole.findMany({
      where: {
        tenantId,
        userId,
        validFrom: { lte: atDate },
        OR: [{ validTo: null }, { validTo: { gte: atDate } }],
      },
      select: userRoleRowSelect,
    });
  }

  /**
   * @param {{ tenantId: string, userId: string }} params
   * @returns {Promise<UserRoleRow[] | null>}
   */
  async findByUser({ tenantId, userId }) {
    return this.prisma.userRole.findMany({
      where: {
        tenantId,
        userId,
      },
      select: userRoleRowSelect,
    });
  }



  /**
   * @param {AssignRoleToUserRepoInput} input
   * @returns {Promise<UserRoleAdminRow>}
   */
  async create(input) {
    const row = await this.prisma.userRole.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        roleId: input.roleId,
        validFrom: input.validFrom,
        validTo: input.validTo,
        createdAt: input.createdAt ? input.createdAt : undefined,
        updatedAt: input.updatedAt ? input.updatedAt : undefined,
      },
      select: userRoleAdminRowSelect,
    });

    return row;
  }
}
