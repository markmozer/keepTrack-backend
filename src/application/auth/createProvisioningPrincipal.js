/**
 * File: src/application/auth/createProvisioningPrincipal.js
 */

import { Role } from "../../domain/authz/authz.types.js"

/**
 * @returns {import("../../domain/auth/Principal").Principal}
 */
export function createProvisioningPrincipal() {
    const provisioningPrincipal = {
        userId: "[provisioningUserId]",
        tenantId: "[provisioningTenantId]",
        roleNames: [Role.SUPER_ADMIN],
    }

    return provisioningPrincipal;
}