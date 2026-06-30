import { describe, expect, it } from "vitest";
import { redactDeep } from "../redact";

describe("redactDeep", () => {
  it("redacts sensitive keys recursively", () => {
    const value = {
      password: "secret",
      nested: {
        token: "abc",
        cookie: "sid=1",
        authorization: "Bearer token",
      },
    };
    expect(redactDeep(value)).toEqual({
      password: "[REDACTED]",
      nested: {
        token: "[REDACTED]",
        cookie: "[REDACTED]",
        authorization: "[REDACTED]",
      },
    });
  });

  it("does not mutate the original object", () => {
    const value = { token: "abc", visible: "ok" };
    const redacted = redactDeep(value);
    expect(redacted).not.toBe(value);
    expect(value.token).toBe("abc");
  });

  it("works with arrays and circular references", () => {
    const value: Record<string, unknown> = { items: [{ api_key: "key" }] };
    value.self = value;
    expect(redactDeep(value)).toEqual({ items: [{ api_key: "[REDACTED]" }], self: "[Circular]" });
  });
});
