import { describe, expect, it } from "bun:test";

import { add, omit, pick, union } from "utils/functions/objects";

describe("Add object utility", () => {
  it("should add a new key-value pair to the object", () => {
    const obj = { a: 1, b: 2 };
    const newObj = add(obj, "c", 3);

    expect(newObj).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("should throw an error when adding a key that already exists", () => {
    const obj = { a: 1, b: 2 };

    // @ts-expect-error
    expect(() => add(obj, "a", 3)).toThrowError(
      'Key "a" already exists in the object.',
    );
  });

  it("should maintain type safety when adding a new key", () => {
    const obj = { a: 1, b: 2 };
    const newObj = add(obj, "c", "three");

    expect(newObj).toEqual({ a: 1, b: 2, c: "three" });
    expect(typeof newObj.c).toBe("string");
    expect(newObj.c).toBe("three");
  });

  it("should work with empty objects", () => {
    const obj = {};
    const newObj = add(obj, "a", 1);

    expect(newObj).toEqual({ a: 1 });
  });
});

describe("Omit object utility", () => {
  it("should omit specified keys from the object", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const newObj = omit(obj, ["b", "c"]);

    expect(newObj).toEqual({ a: 1 });
  });

  it("should return the same object if no keys are specified", () => {
    const obj = { a: 1, b: 2 };
    const newObj = omit(obj, []);

    expect(newObj).toEqual(obj);
  });

  it("should handle non-existent keys gracefully", () => {
    const obj = { a: 1, b: 2 };
    const newObj = omit(obj, ["c" as keyof typeof obj]);

    expect(newObj).toEqual(obj);
  });

  it("should maintain type safety when omitting keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const newObj = omit(obj, ["b"]);

    expect(newObj).toEqual({ a: 1, c: 3 });
    expect((newObj as any).b).toBeUndefined();
  });

  it("should work with empty objects", () => {
    const obj = {};
    const newObj = omit(obj, ["a" as keyof typeof obj]);

    expect(newObj).toEqual({});
  });

  it("should work when all keys are omitted", () => {
    const obj = { a: 1, b: 2 };
    const newObj = omit(obj, ["a", "b"]);

    expect(newObj).toEqual({});
  });
});

describe("Pick object utility", () => {
  it("should pick specified keys from the object", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const newObj = pick(obj, ["a", "c"]);

    expect(newObj).toEqual({ a: 1, c: 3 });
  });

  it("should return an empty object if no keys are specified", () => {
    const obj = { a: 1, b: 2 };
    const newObj = pick(obj, []);

    expect(newObj).toEqual({});
  });

  it("should handle non-existent keys gracefully", () => {
    const obj = { a: 1, b: 2 };
    const newObj = pick(obj, ["c" as keyof typeof obj]);

    // @ts-expect-error
    expect(newObj).toEqual({});
  });

  it("should maintain type safety when picking keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const newObj = pick(obj, ["b"]);

    expect(newObj).toEqual({ b: 2 });
    expect((newObj as any).a).toBeUndefined();
    expect((newObj as any).c).toBeUndefined();
  });

  it("should work with empty objects", () => {
    const obj = {};
    const newObj = pick(obj, ["a" as keyof typeof obj]);

    expect(newObj).toEqual({});
  });

  it("should work when all keys are picked", () => {
    const obj = { a: 1, b: 2 };
    const newObj = pick(obj, ["a", "b"]);

    expect(newObj).toEqual({ a: 1, b: 2 });
    expect(newObj).toEqual(obj);
  });
});

describe("Union object utility", () => {
  it("should merge two objects into one", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3, d: 4 };
    const newObj = union(obj1, obj2);

    expect(newObj).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    expect(newObj).toEqual({ ...obj1, ...obj2 });
    expect(newObj.a).toBe(1);
    expect(newObj.d).toBe(4);
  });

  it("should throw an error when there are overlapping keys", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };

    expect(() => union(obj1, obj2)).toThrowError(
      'Key "b" exists in both objects.',
    );
  });

  it("should maintain type safety when merging objects", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: "three", d: "four" };
    const newObj = union(obj1, obj2);

    expect(newObj).toEqual({ a: 1, b: 2, c: "three", d: "four" });
    expect(typeof newObj.c).toBe("string");
    expect(typeof newObj.b).toBe("number");
  });

  it("should work with empty objects", () => {
    const obj1 = {};
    const obj2 = { a: 1 };
    const newObj = union(obj1, obj2);

    expect(newObj).toEqual({ a: 1 });
  });

  it("should work when both objects are empty", () => {
    const obj1 = {};
    const obj2 = {};
    const newObj = union(obj1, obj2);

    expect(newObj).toEqual({});
  });
});
