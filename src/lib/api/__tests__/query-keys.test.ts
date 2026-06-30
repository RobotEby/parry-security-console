import { describe, expect, it } from "vitest";
import { parryQueryKeys } from "../query-keys";
import type { RuntimeConfig } from "@/lib/config/runtime-config";

describe("query keys", () => {
  it("do not include adminToken", () => {
    const config: RuntimeConfig = {
      apiUrl: "http://localhost",
      adminToken: "secret",
      mode: "remote",
      source: "localStorage",
    };
    const keys = [
      parryQueryKeys.health(config),
      parryQueryKeys.metrics(config),
      parryQueryKeys.events(config, { severity: "high" }),
      parryQueryKeys.event(config, "evt_1"),
      parryQueryKeys.bans(config),
      parryQueryKeys.policies(config),
    ];

    expect(JSON.stringify(keys)).not.toContain("secret");
  });
});
