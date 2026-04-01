/**
 * File: src/tests/helpers/factories/roleFactory.js
 */

export function roleFactory(overrides = {}) {
  return {
    name: "ADMIN",
    ...overrides,
  };
}