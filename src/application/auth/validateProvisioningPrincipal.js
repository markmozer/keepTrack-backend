/**
 * File: src/application/auth/validateProvisioningPrincipal.js
 */


import { v } from "../../domain/shared/validation/validators.js";
import { ValidationError } from "../../domain/shared/errors/index.js";
import { UserStatus } from "../../domain/users/UserStatus.js";
import { Role } from "../../domain/authz/authz.types.js";

/**
 * @param {unknown} input
 * @returns {import("../ports/auth/auth.types.js").AuthenticatedUserDto}
 */
export function validateProvisioningPrincipal(input) {
  const obj = v.object(input, "principal");

  const provisioningUserId = v.string(obj.userId, "userId");
  const provisioningTenantId = v.string(obj.tenantId, "userId");
  
  if (provisioningUserId !== "[provisioningUserId]") throw new ValidationError("provisioning principal not correct", {userId: provisioningUserId});
  if (provisioningTenantId !== "[provisioningTenantId]") throw new ValidationError("provisioning principal not correct", {tenantId: provisioningTenantId});
  

  const roleNames = [Role.SUPER_ADMIN];

  return {
    userId: provisioningUserId,
    tenantId: provisioningTenantId,
    status: UserStatus.ACTIVE,
    roleNames,
  };
}
