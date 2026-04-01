/**
 * File: src/infrastructure/persistance/prisma/repositories/TenantRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 */

const tenantRowSelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  status: true,
};

const tenantAdminRowSelect = {
  ...tenantRowSelect,
  createdAt: true,
  updatedAt: true,
};


/**
 * @implements {TenantRepositoryPort}
 */
export class TenantRepositoryPrisma {
  /**
   * @param {{ prisma: any }} deps
   */
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  /**
   * @param {string} id
   * @returns {Promise<import("../../../../application/ports/tenants/tenant.types.js").TenantAdminRow | null>}
   */
  async findById(id) {
    const row = await this.prisma.tenant.findUnique({
      where: { id },
      select: tenantAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../domain/tenants/TenantType.js").TenantTypeValue} type
   * @returns {Promise<import("../../../../application/ports/tenants/tenant.types.js").TenantAdminRow| null>}
   */
  async findByType(type) {
    const row = await this.prisma.tenant.findFirst({
      where: { type },
      select: tenantAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {string} slug
   * @returns {Promise<import("../../../../application/ports/tenants/tenant.types.js").TenantAdminRow | null>}
   */
  async findBySlug(slug) {
    const row = await this.prisma.tenant.findUnique({
      where: { slug },
      select: tenantAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/tenants/tenant.types.js").CreateTenantRepoInput} input
   * @returns {Promise<import("../../../../application/ports/tenants/tenant.types.js").TenantAdminRow>}
   */
  async create(input) {
    const row = await this.prisma.tenant.create({
      data: {
        id: input.id,
        name: input.name,
        slug: input.slug,
        type: input.type,
        status: input.status,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      },
      select: tenantAdminRowSelect,
    });

    return row;
  }

  /**
     * @param {import("../../../../application/ports/tenants/tenant.types.js").FindTenantsPageRepoInput} input
     * @returns {Promise<import("../../../../application/ports/tenants/tenant.types.js").FindTenantsPageRepoResult>}
     */
    async findPage(input) {
      const { skip, take, filters, sort } = input;
  
      const where = {
        ...(filters.name
          ? {
              name: {
                contains: filters.name,
                mode: "insensitive",
              },
            }
          : {}),
        ...(filters.slug
          ? {
              slug: {
                contains: filters.slug,
                mode: "insensitive",
              },
            }
          : {}),
        ...(filters.type
          ? {
              type: filters.type,
            }
          : {}),    
        ...(filters.status
          ? {
              status: filters.status,
            }
          : {}),
      };
  
      const orderBy = {
        [sort.field]: sort.direction,
      };
  
      const [items, totalItems] = await this.prisma.$transaction([
        this.prisma.tenant.findMany({
          where,
          skip,
          take,
          orderBy,
          select: tenantRowSelect,
        }),
        this.prisma.tenant.count({ where }),
      ]);
  
      return {
        items,
        totalItems,
      };
    }
}