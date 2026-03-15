/**
 * File: src/infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../../../../application/ports/users/user.types.js").UserRowPublic} UserRowPublic
 * @typedef {import("../../../../application/ports/users/user.types.js").CreateUserRepoInput} CreateUserRepoInput
 * @typedef {import("../../../../application/ports/users/user.types.js").FindUserByEmailRepoInput} FindUserByEmailRepoInput
 * @typedef {import("../../../../application/ports/users/user.types.js").FindUserByIdRepoInput } FindUserByIdRepoInput
 * @typedef {import("../../../../application/ports/users/user.types.js").MarkAsInvitedRepoInput} MarkAsInvitedRepoInput
 * @typedef {import("../../../../application/ports/users/user.types.js").FindByInviteTokenHashRepoInput} FindByInviteTokenHashRepoInput
 * @typedef {import("../../../../application/ports/users/user.types.js").ActivateFromInviteRepoInput} ActivateFromInviteRepoInput
 */

const userSelectPublic = {
  id: true,
  tenantId: true,
  email: true,
  inviteTokenExpiresAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
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
   * @param {FindUserByIdRepoInput} params
   * @returns {Promise<UserRowPublic | null>}
   */
  async findById({ tenantId, userId }) {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: userSelectPublic,
    });

    return row ? row : null;
  }

  /**
   * @param {FindUserByEmailRepoInput} params
   * @returns {Promise<UserRowPublic| null>}
   */
  async findByEmail({ tenantId, email }) {
    const row = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      select: userSelectPublic,
    });

    return row ? row : null;
  }

  /**
   * @param {CreateUserRepoInput} input
   * @returns {Promise<UserRowPublic>}
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
      select: userSelectPublic,
    });
    return row;
  }

  /**
   * @param {MarkAsInvitedRepoInput} input
   * @returns {Promise<UserRowPublic>}
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
      select: userSelectPublic,
    });
  }

  /**
   * @param {FindByInviteTokenHashRepoInput} params
   * @returns {Promise<UserRowPublic| null>}
   */
  async findByInviteTokenHash({ inviteTokenHash }) {
    const row = await this.prisma.user.findFirst({
      where: { inviteTokenHash },
      select: userSelectPublic,
    });

    return row ? row : null;
  }

  /**
   * @param {ActivateFromInviteRepoInput} params
   * @returns {Promise<UserRowPublic>}
   */
  async activateFromInvite({ userId, passwordHash, inviteTokenHash, inviteTokenExpiresAt, status, updatedAt  }) {
    const row = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status,
        inviteTokenHash,
        inviteTokenExpiresAt,
        passwordHash,
        updatedAt,
      },
      select: userSelectPublic,
    });

    return row;
  }
}
