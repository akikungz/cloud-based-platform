import { describe, expect, it } from "bun:test";

import { create_callback } from "utils/functions/callback";

describe("Create Callback", () => {
  it("should return result when callback resolves", async () => {
    const [error, result] = await create_callback(() => 42);

    expect(error).toBeNull();
    expect(result).toBe(42);
  });

  it("should return error when callback rejects", async () => {
    const [error, result] = await create_callback<Error, () => void>(async () => {
      throw new Error("Test error");
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("Test error");
    expect(result).toBeNull();
  });

  it("should handle non-Error rejections", async () => {
    const [error, result] = await create_callback(async () => {
      throw "String error";
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toInclude("Unknown error");
    expect(result).toBeNull();
  });

  it("should work with synchronous callbacks", async () => {
    const [error, result] = await create_callback(() => {
      return new Promise((resolve) => setTimeout(() => resolve(100), 100));
    });

    expect(error).toBeNull();
    expect(result).toBe(100);
  });

  it("should work with asynchronous callbacks", async () => {
    const [error, result] = await create_callback(() => Promise.resolve(200));

    expect(error).toBeNull();
    expect(result).toBe(200);
  });
});
