/**
 * File: src/infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 */

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

export const userAdminRowSelect = {
  ...userRowSelect,
  inviteTokenExpiresAt: true,
  resetTokenExpiresAt: true,
  createdAt: true,
  updatedAt: true,
};

export const userAuthRowSelect = {
  id: true,
  tenantId: true,
  email: true,
  status: true,
  passwordHash: true,
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
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByIdRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserAdminRow | null>}
   */
  async findById({ tenantId, userId }) {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: userAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByEmailRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserAdminRow| null>}
   */
  async findByEmail({ tenantId, email }) {
    const row = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      select: userAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").CreateUserRepoInput} input
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserAdminRow>}
   */
  async create(input) {
    const row = await this.prisma.user.create({
      data: {
        id: input.id,
        tenantId: input.tenantId,
        email: input.email,
        status: input.status,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      },
      select: userAdminRowSelect,
    });
    return row;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").MarkAsInvitedRepoInput} input
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserAdminRow>}
   */
  async markAsInvited({
    userId,
    status,
    inviteTokenHash,
    inviteTokenExpiresAt,
    updatedAt,
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status, inviteTokenHash, inviteTokenExpiresAt, updatedAt },
      select: userAdminRowSelect,
    });
  }

  /**
   * @param {string} inviteTokenHash
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserAdminRow| null>}
   */
  async findByInviteTokenHash(inviteTokenHash) {
    const row = await this.prisma.user.findFirst({
      where: { inviteTokenHash },
      select: userAdminRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").ActivateFromInviteRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserAdminRow>}
   */
  async activateFromInvite({
    userId,
    passwordHash,
    inviteTokenHash,
    inviteTokenExpiresAt,
    status,
    updatedAt,
  }) {
    const row = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status,
        inviteTokenHash,
        inviteTokenExpiresAt,
        passwordHash,
        updatedAt,
      },
      select: userAdminRowSelect,
    });

    return row;
  }

  /**
   * @param {import("../../../../application/ports/auth/auth.types.js").FindUserByEmailForAuthRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserAuthRow| null>}
   */
  async findByEmailForAuth({ tenantId, email }) {
    const row = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      select: userAuthRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").MarkAsPwdResetRequestedRepoInput} input
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserAdminRow>}
   */
  async markAsPwdResetRequested({
    userId,
    resetTokenHash,
    resetTokenExpiresAt,
    updatedAt,
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { resetTokenHash, resetTokenExpiresAt, updatedAt },
      select: userAdminRowSelect,
    });
  }

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
