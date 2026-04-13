/**
 * File: src/tests/helpers/assertions/expectRoleList.js
 */


import { expectRoleDto } from "./expectRoleDto.js";
import { expectPagedResult } from "./expectPagedResult.js";

export function expectRoleList(result, { page, pageSize }) {
  expectPagedResult(result, { page, pageSize });

  result.items.forEach((role) => {
    expectRoleDto(role);
  });
}
