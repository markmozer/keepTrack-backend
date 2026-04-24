/**
 * File: src/infrastructure/services/url/TenantLinkBuilderService.js
 */


/**
 * @typedef {import("../../../application/ports/urls/TenantLinkBuilderServicePort.js").TenantLinkBuilderServicePort} TenantLinkBuilderServicePort} TenantLinkBuilderServicePort
 * @typedef {import("../../../app/config/appConfig.js").FrontendConfig} FrontendConfig
 * @typedef {import("../../../application/ports/urls/TenantLinkBuilderServicePort.js").BuildInviteLinkInput} BuildInviteLinkInput
 * @typedef {import("../../../application/ports/urls/TenantLinkBuilderServicePort.js").BuildPasswordResetLinkInput} BuildPasswordResetLinkInput
 */


/**
 * @implements {TenantLinkBuilderServicePort}
 */
export class TenantLinkBuilderService {
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
    const { protocol, baseDomain } = this.config;
    const { slug, token } = input;

    if (!slug || typeof slug !== "string") {
      throw new Error("Invalid slug.");
    }

    if (!token || typeof token !== "string") {
      throw new Error("Invalid token.");
    }

    const url = new URL(`${protocol}://${baseDomain}`);
    url.pathname = `/t/${slug}/accept-invite`;
    url.searchParams.set("token", token);
    return url.toString();
  }

    /**
   * @param {BuildPasswordResetLinkInput} input
   * @returns {string}
   */
  buildPasswordResetLink(input) {
    const { protocol, baseDomain } = this.config;
    const { slug, token } = input;

    if (!slug || typeof slug !== "string") {
      throw new Error("Invalid slug.");
    }

    if (!token || typeof token !== "string") {
      throw new Error("Invalid token.");
    }

    const url = new URL(`${protocol}://${baseDomain}`);
    url.pathname = `/t/${slug}/reset-password`;
    url.searchParams.set("token", token);
    return url.toString();
  }
}


