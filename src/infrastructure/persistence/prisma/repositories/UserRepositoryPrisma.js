/**
 * File: src/infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js
 */

/**
 * @typedef {import("../../../../application/ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../../../../application/ports/users/user.types.js").UserRowPublic} UserRowPublic
 * @typedef {import("../../../../application/ports/users/user.types.js").CreateUserRepoInput} CreateUserRepoInput
 * @typedef {import("../../../../application/ports/users/user.types.js").FindUserByEmailInput} FindUserByEmailInput
 * @typedef {import("../../../../application/ports/users/user.types.js").FindUserByIdInput } FindUserByIdInput
 * @typedef {import("../../../../application/ports/users/user.types.js").SetInviteTokenRepoInput} SetInviteTokenRepoInput
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
   * @param {FindUserByIdInput} params
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
   * @param {FindUserByEmailInput} params
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
   * @param {SetInviteTokenRepoInput} input
   * @returns {Promise<UserRowPublic>}
   */
  async setInviteToken({
    userId,
    tenantId,
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
}
