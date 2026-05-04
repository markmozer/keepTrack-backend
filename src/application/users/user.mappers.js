/**
 * File: src/application/users/user.mappers.js
 */

/**
 * @param {import("../../domain/users/User.js").User} user
 * @returns {import("../ports/users/user.types.js").UserListItemDto}
 */
export function toUserDto(user) {
  if (!user.id) {
    throw new Error("Cannot map user without id to UserListItemDto.");
  }

  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    status: user.status,
    roleNames: user.userRoles
      .map((userRole) => userRole.roleName)
      .filter((roleName) => typeof roleName === "string"),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),  
  };
}

/**
 * @param {Date | null | undefined} value
 * @returns {string | null}
 */
function toIsoOrNull(value) {
  return value ? value.toISOString() : null;
}

/**
 * @param {import("../../domain/users/User.js").User} user
 * @param {object} [options]
 * @param {import("../ports/users/user.types.js").UserAvailableActionsDto} [options.availableActions]
 * @param {Record<string, import("../ports/users/user.types.js").UserRoleAvailableActionsDto>} [options.userRoleAvailableActionsById]
 * @returns {import("../ports/users/user.types.js").PublicUserDto}
 */
export function toPublicUserDto(
  user,
  { availableActions = undefined, userRoleAvailableActionsById = {} } = {},
) {
  if (!user.id) {
    throw new Error("Cannot map user without id to PublicUserDto.");
  }

  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    status: user.status,

    userRoles: user.userRoles.map((userRole) => {
      if (!userRole.id) {
        throw new Error("Cannot map userRole without id to PublicUserRoleDto.");
      }

      return {
        id: userRole.id,
        tenantId: userRole.tenantId,
        userId: userRole.userId,
        roleId: userRole.roleId,
        validFrom: userRole.validFrom.toISOString(),
        validTo: toIsoOrNull(userRole.validTo),
        createdAt: userRole.createdAt.toISOString(),
        updatedAt: userRole.updatedAt.toISOString(),
        roleName: userRole.roleName ?? null,

        availableActions:
          userRoleAvailableActionsById[userRole.id] ?? undefined,
      };
    }),

    inviteTokenExpiresAt: toIsoOrNull(user.inviteTokenExpiresAt),
    resetTokenExpiresAt: toIsoOrNull(user.resetTokenExpiresAt),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),

    availableActions,
  };
}
