import { describe, expect, it } from "vitest";
import { normalizeDetectorLabel, normalizeDetectorSlug } from "../detectors";

describe("detector normalization", () => {
  it("prefers public detector slugs", () => {
    expect(normalizeDetectorSlug({ detector: "sql" })).toBe("sql");
    expect(normalizeDetectorLabel({ detector: "sql" })).toBe("SQL Injection");
  });

  it("accepts detectorSlug fallback", () => {
    expect(normalizeDetectorSlug({ detectorSlug: "xss" })).toBe("xss");
    expect(normalizeDetectorLabel({ detectorSlug: "xss" })).toBe("XSS");
  });

  it("accepts legacy detectorType fallback", () => {
    expect(normalizeDetectorSlug({ detectorType: "SQL_INJECTION" })).toBe("sql");
    expect(normalizeDetectorLabel({ detectorType: "BRUTE_FORCE" })).toBe("Brute Force");
  });

  it("accepts module fallback without crashing", () => {
    expect(normalizeDetectorLabel({ module: "custom_guard" })).toBe("Custom Guard");
  });
});
