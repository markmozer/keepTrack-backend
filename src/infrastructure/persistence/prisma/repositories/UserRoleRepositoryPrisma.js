/**
 * File: src/infrastructure/persistence/prisma/repositories/UserRoleRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} UserRoleRepositoryPort
 * @typedef {import("../../../../application/ports/userRoles/userRole.types.js").UserRoleRow} UserRoleRow
 * @typedef {import("../../../../application/ports/userRoles/userRole.types.js").AssignRoleToUserRepoInput} AssignRoleToUserRepoInput
 */

const userRoleSelect = {
  id: true,
  tenantId: true,
  userId: true,
  roleId: true,
  validFrom: true,
  validTo: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      name: true,
    },
  },
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
   * @returns {Promise<UserRoleRow | null>}
   */
  async findByUserAndRole({ tenantId, userId, roleId }) {
    const row = await this.prisma.userRole.findUnique({
      where: {
        tenantId_userId_roleId: { tenantId, userId, roleId },
      },
      select: userRoleSelect,
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
      select: userRoleSelect,
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
      select: userRoleSelect,
    });
  }



  /**
   * @param {AssignRoleToUserRepoInput} input
   * @returns {Promise<UserRoleRow>}
   */
  async create(input) {
    const row = await this.prisma.userRole.create({
      data: {
        id: input.id,
        tenantId: input.tenantId,
        userId: input.userId,
        roleId: input.roleId,
        validFrom: input.validFrom,
        validTo: input.validTo,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      },
      select: userRoleSelect,
    });

    return row;
  }
}
