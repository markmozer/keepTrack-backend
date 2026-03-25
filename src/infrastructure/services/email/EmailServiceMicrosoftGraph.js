/**
 * File: src/infrastructure/services/email/EmailServiceMicrosoftGraph.js
 */

import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
// import "isomorphic-fetch"; // soms nodig afhankelijk van je setup

import { buildInviteUserEmail } from "./templates/inviteUserEmail.js";

/**
 * @typedef {import("../../../shared/config/appConfig.js").MsGraphEmailConfig} MsGraphEmailConfig
 */

/**
 * Narrow unknown error safely for logging.
 *
 * @param {unknown} err
 * @returns {{ code?: unknown, message?: unknown, statusCode?: unknown, status?: unknown }}
 */
function asErrorInfo(err) {
  if (err && typeof err === "object") {
    return /** @type {any} */ (err);
  }
  return {};
}

export class EmailServiceMicrosoftGraph {
  /**
   * @param {Object} params
   * @param {MsGraphEmailConfig} params.config
   */
  constructor({ config }) {
    if (
      !config ||
      !config.tenantId ||
      !config.clientId ||
      !config.clientSecret ||
      !config.userPrincipalName
    ) {
      throw new Error("Invalid MS Graph config");
    }

    this.userPrincipalName = config.userPrincipalName;

    const credential = new ClientSecretCredential(
      config.tenantId,
      config.clientId,
      config.clientSecret,
    );

    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await credential.getToken(
            "https://graph.microsoft.com/.default",
          );

          if (!tokenResponse?.token) {
            throw new Error("Failed to acquire access token");
          }
          return tokenResponse.token;
        },
      },
    });
  }

  /**
   * @param {import("../../../application/ports/email/EmailServicePort.js").SendInviteUserEmailInput} params
   * @returns {Promise<void>}
   */
  async sendInviteUserEmail({ to, link, expiresAt }) {
    const { subject, contentType, content } = buildInviteUserEmail({
      link,
      expiresAt,
    });

    const mail = {
      message: {
        subject,
        body: {
          contentType, // "Text" or "HTML"
          content,
        },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    };

    try {
      await this.graphClient
        .api(`/users/${this.userPrincipalName}/sendMail`)
        .post(mail);
    } catch (error) {
      const info = asErrorInfo(error);

      console.error("EmailServiceMicrosoftGraph: sendInviteUserEmail failed", {
        to,
        code: info.code,
        message: info.message,
        statusCode: info.statusCode ?? info.status,
      });

      throw new Error("Email send failed");
    }
  }
}
