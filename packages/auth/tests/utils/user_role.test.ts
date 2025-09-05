import { describe, expect, it } from "bun:test";

import * as role from "auth/utils/role";

describe("Role Validator", () => {
  it("should return staff role for staff email", () => {
    expect(role.role_validator("test.s@itm.kmutnb.ac.th"))
      .toBe(role.Role.Staff); // Basic pattern for fitm staff email from university

    expect(role.role_validator("test.s@fitm.kmutnb.ac.th"))
      .toBe(role.Role.Rejected); // Basic pattern for fitm staff email from faculty
  });

  it("should return student role for student email", () => {
    expect(role.role_validator("s6506022620036@email.kmutnb.ac.th"))
      .toBe(role.Role.Student); // Student email start with s + 2 digits year + 0602 + 7 digits ID

    expect(role.role_validator("s6506022620036@kmutnb.ac.th"))
      .toBe(role.Role.Rejected); // This is microsoft365 email, not a google email
  });

  it("should return rejected role for invalid email", () => {
    expect(role.role_validator("akikungz@proton.me")).toBe(role.Role.Rejected);
    expect(role.role_validator("thitipong.t@email.kmutnb.ac.th"))
      .toBe(role.Role.Rejected); // Can't use alias email for login
  });
});
