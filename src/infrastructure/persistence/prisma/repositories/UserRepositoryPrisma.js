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

export const userDetailRowSelect = {
  id: true,
  tenantId: true,
  email: true,
  status: true,
  inviteTokenExpiresAt: true,
  resetTokenExpiresAt: true,
  createdAt: true,
  updatedAt: true,
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

export const forgotPasswordUserRowSelect = {
  id: true,
  tenantId: true,
  email: true,
  status: true,
  resetTokenHash: true,
  resetTokenExpiresAt: true,
  createdAt: true,
  updatedAt: true,
  userRoles: userDetailRowSelect.userRoles,
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
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow | null>}
   */
  async findById({ tenantId, userId }) {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: userDetailRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByEmailRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow| null>}
   */
  async findByEmail({ tenantId, email }) {
    const row = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      select: userDetailRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindForgotPasswordUserByEmailRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").ForgotPasswordUserRow | null>}
   */
  async findForgotPasswordUserByEmail({ tenantId, email }) {
    const row = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      select: forgotPasswordUserRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").CreateUserRepoInput} input
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow>}
   */
  async create(input) {
    const row = await this.prisma.user.create({
      data: {
        tenantId: input.tenantId,
        email: input.email,
        createdAt: input.createdAt ? input.createdAt : undefined,
        updatedAt: input.updatedAt ? input.updatedAt : undefined,
      },
      select: userDetailRowSelect,
    });
    return row;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").MarkAsInvitedRepoInput} input
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow>}
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
      select: userDetailRowSelect,
    });
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByInviteTokenHashRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow| null>}
   */
  async findByInviteTokenHash({ tenantId, inviteTokenHash }) {
    const row = await this.prisma.user.findFirst({
      where: { tenantId, inviteTokenHash },
      select: userDetailRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").FindUserByResetTokenHashRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow| null>}
   */
  async findByResetTokenHash({ tenantId, resetTokenHash }) {
    const row = await this.prisma.user.findFirst({
      where: { tenantId, resetTokenHash },
      select: userDetailRowSelect,
    });

    return row ? row : null;
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").ActivateFromInviteRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow>}
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
      select: userDetailRowSelect,
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
   * @param {import("../../../../application/ports/users/user.types.js").ForgotPasswordRepoInput} input
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow>}
   */
  async markForForgotPassword({
    userId,
    resetTokenHash,
    resetTokenExpiresAt,
    updatedAt,
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { resetTokenHash, resetTokenExpiresAt, updatedAt },
      select: userDetailRowSelect,
    });
  }

  /**
   * @param {import("../../../../application/ports/users/user.types.js").ResetPasswordRepoInput} params
   * @returns {Promise<import("../../../../application/ports/users/user.types.js").UserDetailRow>}
   */
  async resetPassword({
    userId,
    passwordHash,
    resetTokenHash,
    resetTokenExpiresAt,
    updatedAt,
  }) {
    const row = await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetTokenHash,
        resetTokenExpiresAt,
        passwordHash,
        updatedAt,
      },
      select: userDetailRowSelect,
    });

    return row;
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
