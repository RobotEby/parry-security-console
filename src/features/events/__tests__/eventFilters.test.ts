import { describe, expect, it } from "vitest";
import { parseEventFilters } from "../eventFilters";

describe("eventFiltersSchema", () => {
  it("accepts limit and offset as strings", () => {
    expect(parseEventFilters({ limit: "50", offset: "10" })).toMatchObject({
      limit: 50,
      offset: 10,
    });
  });

  it("falls back to safe defaults for invalid numeric values", () => {
    expect(parseEventFilters({ limit: "nope", offset: "-2" })).toMatchObject({
      limit: 25,
      offset: 0,
    });
  });

  it("converts empty strings to undefined", () => {
    expect(parseEventFilters({ q: "", type: "" })).toMatchObject({ q: undefined, type: undefined });
  });
});
