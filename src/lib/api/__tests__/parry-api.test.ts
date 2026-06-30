import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHealthWithConfig } from "../parry-api";

describe("parry-api", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("getHealthWithConfig does not persist runtime config", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ ok: true, name: "parry", version: "1", uptimeMs: 1, store: "redis" }),
        { status: 200 },
      ),
    );
    await getHealthWithConfig({ apiUrl: "http://localhost/_parry", adminToken: "token" });
    expect(window.localStorage.length).toBe(0);
  });
});
