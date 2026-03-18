/**
 * File: src/infrastructure/persistence/prisma/repositories/RoleRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} RoleRepositoryPort
 * @typedef {import("../../../../application/ports/roles/role.types.js").RoleRow} RoleRow
 * @typedef {import("../../../../application/ports/roles/role.types.js").CreateRoleRepoInput} CreateRoleRepoInput
 * @typedef {import("../../../../application/ports/roles/role.types.js").FindRoleByIdRepoInput} FindRoleByIdRepoInput
 * @typedef {import("../../../../application/ports/roles/role.types.js").FindRoleByNameRepoInput} FindRoleByNameRepoInput
 */

const roleSelect = {
  id: true,
  tenantId: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * @implements {RoleRepositoryPort}
 */
export class RoleRepositoryPrisma {
  /**
   * @param {{ prisma: any }} deps
   */
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  /**
   * @param {FindRoleByIdRepoInput} params
   * @returns {Promise<RoleRow | null>}
   */
  async findById({ tenantId, roleId }) {
    const row = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId },
      select: roleSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {FindRoleByNameRepoInput} params
   * @returns {Promise<RoleRow| null>}
   */
  async findByName({ tenantId, name }) {
    const row = await this.prisma.role.findUnique({
      where: { tenantId_name: { tenantId, name } },
      select: roleSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {CreateRoleRepoInput} input
   * @returns {Promise<RoleRow>}
   */
  async create(input) {
    const row = await this.prisma.role.create({
      data: {
        id: input.id,
        tenantId: input.tenantId,
        name: input.name,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      },
      select: roleSelect,
    });

    return row;
  }
}
