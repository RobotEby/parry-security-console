import { describe, expect, it } from "vitest";
import {
  bansResponseSchema,
  banSchema,
  eventsResponseSchema,
  metricsSchema,
  threatEventSchema,
} from "../schemas";

describe("api schemas", () => {
  it("applies metrics defaults", () => {
    const parsed = metricsSchema.parse({});
    expect(parsed.totalRequests).toBe(0);
    expect(parsed.eventsByType).toEqual({});
    expect(parsed.activeBans).toBe(0);
  });

  it("validates severity", () => {
    expect(() =>
      threatEventSchema.parse({
        id: "1",
        type: "X",
        severity: "severe",
        action: "blocked",
        timestamp: "now",
      }),
    ).toThrow();
  });

  it("accepts events response pagination", () => {
    const parsed = eventsResponseSchema.parse({
      data: [],
      pagination: { limit: "25", offset: "0", total: "0" },
    });
    expect(parsed.pagination.limit).toBe(25);
  });

  it("accepts new normalized ban entries", () => {
    const parsed = banSchema.parse({
      key: "ip:127.0.0.1",
      type: "ip",
      reason: "Too many authentication attempts",
      policyName: "auth-login",
      createdAt: "2026-06-29T00:00:00.000Z",
      expiresAt: "2026-06-29T00:10:00.000Z",
      ttlMs: 600000,
      metadata: { password: "must-not-survive" },
    });

    expect(parsed).toEqual({
      key: "ip:127.0.0.1",
      type: "ip",
      reason: "Too many authentication attempts",
      policyName: "auth-login",
      createdAt: "2026-06-29T00:00:00.000Z",
      expiresAt: "2026-06-29T00:10:00.000Z",
      ttlMs: 600000,
    });
    expect(JSON.stringify(parsed)).not.toContain("password");
  });

  it("accepts legacy ban entries and normalizes them", () => {
    const parsed = banSchema.parse({
      key: "127.0.0.1",
      banExpiresAt: 1782774762631,
      metadata: {
        reason: "test",
        policyName: "auth-login",
        createdAt: "2026-06-29T00:00:00.000Z",
        token: "must-not-survive",
      },
    });

    expect(parsed).toMatchObject({
      key: "ip:127.0.0.1",
      type: "ip",
      reason: "test",
      policyName: "auth-login",
      createdAt: "2026-06-29T00:00:00.000Z",
      expiresAt: new Date(1782774762631).toISOString(),
    });
    expect(JSON.stringify(parsed)).not.toContain("token");
  });

  it("accepts bans response pagination", () => {
    const parsed = bansResponseSchema.parse({
      data: [],
      pagination: { limit: "50", offset: "0", total: "0" },
    });

    expect(parsed.pagination).toEqual({ limit: 50, offset: 0, total: 0 });
  });

  it("accepts detector compatibility fields on events", () => {
    const parsed = threatEventSchema.parse({
      id: "evt_1",
      type: "SQL_INJECTION_BLOCKED",
      module: "detector",
      detector: "sql",
      detectorSlug: "sql",
      detectorType: "SQL_INJECTION",
      severity: "high",
      action: "blocked",
      timestamp: "2026-06-29T00:00:00.000Z",
    });

    expect(parsed.detector).toBe("sql");
    expect(parsed.detectorSlug).toBe("sql");
    expect(parsed.detectorType).toBe("SQL_INJECTION");
  });
});
