/**
 * File: src/infrastructure/persistance/prisma/repositories/TenantRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../../../../application/ports/tenants/tenant.types.js").TenantRow} TenantRow
 * @typedef {import("../../../../application/ports/tenants/tenant.types.js").CreateTenantRepoInput} CreateTenantRepoInput
 */

const tenantSelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  status: true,
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
   * @returns {Promise<TenantRow | null>}
   */
  async findById(id) {
    const row = await this.prisma.tenant.findUnique({
      where: { id },
      select: tenantSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {string} slug
   * @returns {Promise<TenantRow| null>}
   */
  async findBySlug(slug) {
    const row = await this.prisma.tenant.findUnique({
      where: { slug },
      select: tenantSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {CreateTenantRepoInput} input
   * @returns {Promise<TenantRow>}
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
      select: tenantSelect,
    });

    return row;
  }
}