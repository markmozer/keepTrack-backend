/**
 * File: src/infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js
 */

import {
  toPrivateUserDomainForAuthOrNull,
  toPublicUserDomain,
  toPublicUserDomainOrNull,
} from "../mappers/UserPrismaMapper.js";

/**
 * @typedef {import("../../../../application/ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../../../../domain/users/User.js").User} User
 */

export const userRoleRowSelect = {
  userRoles: {
    select: {
      id: true,
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
    },
    orderBy: [{ validFrom: "asc" }, { createdAt: "asc" }],
  },
};

export const publicUserRowSelect = {
  id: true,
  tenantId: true,
  email: true,
  status: true,
  inviteTokenExpiresAt: true,
  resetTokenExpiresAt: true,
  createdAt: true,
  updatedAt: true,
  ...userRoleRowSelect,
};

export const privateUserRowSelectForAuth = {
  ...publicUserRowSelect,
  passwordHash: true,
  inviteTokenHash: true,
  resetTokenHash: true,
  ...userRoleRowSelect,
};

export const userRowSelect = {
  id: true,
  tenantId: true,
  email: true,
  status: true,
  userRoles: {
    select: {
      role: {
        select: {
          name: true,
        },
      },
    },
  },
};


/**
 * @implements {UserRepositoryPort}
 */
export class UserRepositoryPrisma {
  /**
   * @param {{ prisma: any }} deps
   */
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  /**
   * @param {User} user
   * @returns {Promise<User>}
   */
  async create(user) {
    const row = await this.prisma.user.create({
      data: {
        tenantId: user.tenantId,
        email: user.email,
        createdAt: user.createdAt ? user.createdAt : undefined,
        updatedAt: user.updatedAt ? user.updatedAt : undefined,
      },
      select: publicUserRowSelect,
    });
    return toPublicUserDomain(row);
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByIdRepoInput} params
   * @returns {Promise<User | null>}
   */
  async findById({ tenantId, userId }) {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: publicUserRowSelect,
    });

    return toPublicUserDomainOrNull(row);
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByEmailRepoInput} params
   * @returns {Promise<User | null>}
   */
  async findByEmail({ tenantId, email }) {
    const row = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      select: publicUserRowSelect,
    });

    return toPublicUserDomainOrNull(row);
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByEmailRepoInput} params
   * @returns {Promise<User | null>}
   */
  async findByEmailForAuth({ tenantId, email }) {
    const row = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      select: privateUserRowSelectForAuth,
    });

    return toPrivateUserDomainForAuthOrNull(row);
  }

  /**
   * @param {User} user
   * @returns {Promise<User>}
   */
  async save(user) {
    const row = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        inviteTokenHash: user.inviteTokenHash,
        inviteTokenExpiresAt: user.inviteTokenExpiresAt,
        resetTokenHash: user.resetTokenHash,
        resetTokenExpiresAt: user.resetTokenExpiresAt,
        status: user.status,
      },
      select: publicUserRowSelect,
    });

    return toPublicUserDomain(row);
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByInviteTokenHashRepoInput} params
   * @returns {Promise<User| null>}
   */
  async findByInviteTokenHash({ tenantId, inviteTokenHash }) {
    const row = await this.prisma.user.findFirst({
      where: { tenantId, inviteTokenHash },
      select: privateUserRowSelectForAuth,
    });

    return toPrivateUserDomainForAuthOrNull(row);
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByResetTokenHashRepoInput} params
   * @returns {Promise<User | null>}
   */
  async findByResetTokenHash({ tenantId, resetTokenHash }) {
    const row = await this.prisma.user.findFirst({
      where: { tenantId, resetTokenHash },
      select: privateUserRowSelectForAuth,
    });

    return toPrivateUserDomainForAuthOrNull(row);
  }

  // ========================== TO BE CHANGED ==================


  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUsersPageRepoInput} input
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").FindUsersPageRepoResult>}
   */
  async findPage(input) {
    const { tenantId, skip, take, filters, sort } = input;

    const where = {
      tenantId,
      ...(filters.email
        ? {
            email: {
              contains: filters.email,
              mode: "insensitive",
            },
          }
        : {}),
      ...(filters.status
        ? {
            status: filters.status,
          }
        : {}),
      ...(filters.roleName
        ? {
            userRoles: {
              some: {
                role: {
                  name: filters.roleName,
                },
              },
            },
          }
        : {}),
    };

    const orderBy = {
      [sort.field]: sort.direction,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: userRowSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      totalItems,
    };
  }
}
