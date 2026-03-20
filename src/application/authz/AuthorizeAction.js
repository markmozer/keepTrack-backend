/**
 * File: src/application/authz/AuthorizeAction.js
 */


import { ForbiddenError, UnauthorizedError } from "../../domain/shared/errors/index.js";

/**
 * @typedef {Object} AuthorizeActionInput
 * @property {import("../../domain/authz/RolePolicy.js").RolePolicy} policy
 */

export class AuthorizeAction {
  /**
   * 
   * @param {AuthorizeActionInput} params 
   */
  constructor({ policy }) {
    this.policy = policy;
  }

  /**
   * 
   * @param {import("../../domain/authz/authz.types.js").AuthorizeRequest} params
   */
  execute({ principal, action, resource, context = {} }) {
    if (!principal?.userId) throw new UnauthorizedError();

    const allowed = this.policy.isAllowed({ principal, action, resource, context });
    if (!allowed) {
      throw new ForbiddenError("Action not allowed", { action, resource, context });
    }
  }
}