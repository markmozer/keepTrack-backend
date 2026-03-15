/**
 * File: keepTrack-backend/src/domain/auth/systemPrincipal.js
 */

/**
 * 
 * @param {{tenantId: string}} param
 * @returns {import("../ports/auth/auth.types.js").Principal}
 */
export function createSystemPrincipal({ tenantId }) {
  return {
    userId: "system",
    tenantId,
    roles: ["SYSTEM"],
  };
}