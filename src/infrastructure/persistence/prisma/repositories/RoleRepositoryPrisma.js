/**
 * File: src/infrastructure/persistence/prisma/repositories/RoleRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} RoleRepositoryPort
 */

const roleRowSelect = {
  id: true,
  tenantId: true,
  name: true,
};

const roleAdminRowSelect = {
  ...roleRowSelect,
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
   * @param {import("../../../../application/ports/roles/role.types.js").FindRoleByIdRepoInput} params
   * @returns {Promise<import("../../../../application/ports/roles/role.types.js").RoleAdminRow | null>}
   */
  async findById({ tenantId, roleId }) {
    const row = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId },
      select: roleAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/roles/role.types.js").FindRoleByNameRepoInput} params
   * @returns {Promise<import("../../../../application/ports/roles/role.types.js").RoleAdminRow| null>}
   */
  async findByName({ tenantId, name }) {
    const row = await this.prisma.role.findUnique({
      where: { tenantId_name: { tenantId, name } },
      select: roleAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/roles/role.types.js").CreateRoleRepoInput} input
   * @returns {Promise<import("../../../../application/ports/roles/role.types.js").RoleAdminRow>}
   */
  async create(input) {
    const row = await this.prisma.role.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        createdAt: input.createdAt ? input.createdAt : undefined,
        updatedAt: input.updatedAt ? input.updatedAt : undefined,
      },
      select: roleAdminRowSelect,
    });

    return row;
  }

  /**
   * @param {import("../../../../application/ports/roles/role.types.js").EnsureRoleRepoInput} input
   * @returns {Promise<import("../../../../application/ports/roles/role.types.js").RoleAdminRow>}
   */
  async ensure(input) {
    const createdAt = input.createdAt ? input.createdAt : undefined;
    const updatedAt = input.updatedAt ? input.updatedAt : undefined;
    
    const row = await this.prisma.role.upsert({
      where: { tenantId_name: { tenantId: input.tenantId, name: input.name } },
      update: {},
      create: { tenantId: input.tenantId, name: input.name, createdAt, updatedAt },
    });

    return row;
  }

  /**
   * @param {import("../../../../application/ports/roles/role.types.js").FindRolesPageRepoInput} input
   * @returns {Promise<import("../../../../application/ports/roles/role.types.js").FindRolesPageRepoResult>}
   */
  async findPage(input) {
    const { tenantId, skip, take, filters, sort } = input;

    const where = {
      tenantId,
      ...(filters.roleName
        ? {
            name: {
              contains: filters.roleName,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const orderBy = {
      [sort.field]: sort.direction,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        skip,
        take,
        orderBy,
        select: roleRowSelect,
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      items,
      totalItems,
    };
  }
}
