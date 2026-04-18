/**
 * File: keepTrack-backend/src/application/users/getUserById.validation.js
 */


import { v } from "../../domain/shared/validation/validators.js";

/**
 * @param {import("../ports/users/user.types.js").GetUserByIdUCPayload} input
 */
export function validateGetUserByIdPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["userId"],
    requiredKeys: ["userId"],
  });

  const userId = v.uuid(input?.userId, "userId");


  return { userId };
}
