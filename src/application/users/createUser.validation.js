/**
 * File: src/application/users/createUser.validation.js
 */
import { v } from "../../domain/shared/validation/validators.js";
import {
  validateUserEmail,
} from "../../domain/users/createUser.js";


/**
 * @param {import("../ports/users/user.types.js").CreateUserUCPayload} input
 */
export function validateCreateUserPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["email"],
    requiredKeys: ["email"],
  });

  const email = validateUserEmail(input?.email);


  return { email };
}
