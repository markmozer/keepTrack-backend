/**
 * File: src/infrastructure/urls/TenantInviteLinkBuilder.js
 */

/**
 * @typedef {import("../../../shared/config/appConfig.js").FrontendConfig} FrontendConfig
 * @typedef {import("../../../application/ports/urls/InviteLinkBuilderPort.js").BuildInviteLinkInput} BuildInviteLinkInput
 */

export class TenantInviteLinkBuilder {
  /**
   * @param {Object} params
   * @param {FrontendConfig} params.config
   */
  constructor({ config }) {
    this.config = config;
  }


  /**
   * @param {BuildInviteLinkInput} input
   * @returns {string}
   */
  buildInviteLink(input) {
    const { tenantMode, protocol, baseDomain } = this.config;
    
    const { slug, token } = input;

    if (!slug || typeof slug !== "string") {
      throw new Error("Invalid slug.");
    }

    if (!token || typeof token !== "string") {
      throw new Error("Invalid token.");
    }

    const path = `/accept-invite?token=${encodeURIComponent(token)}`;
    

    if (tenantMode === "path") {
      return `${protocol}://${baseDomain}/${slug}${path}`;
    }

    return `${protocol}://${slug}.${baseDomain}${path}`;
  }
}


