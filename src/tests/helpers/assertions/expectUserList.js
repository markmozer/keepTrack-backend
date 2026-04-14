/**
 * File: src/tests/helpers/assertions/expectUserList.js
 */


import { expectUserDto } from "./expectUserDto.js";
import { expectPagedResult } from "./expectPagedResult.js";

export function expectUserList(result, { page, pageSize }) {
  expectPagedResult(result, { page, pageSize });

  result.items.forEach((user) => {
    expectUserDto(user);
  });
}
