import type { RuntimeConfig } from "@/lib/config/runtime-config";
import type { EventFilters } from "./mocks";

const base = (config: RuntimeConfig) => ["parry", config.mode, config.apiUrl] as const;

export const parryQueryKeys = {
  health: (config: RuntimeConfig) => [...base(config), "health"] as const,
  metrics: (config: RuntimeConfig) => [...base(config), "metrics"] as const,
  events: (config: RuntimeConfig, filters: EventFilters) =>
    [...base(config), "events", filters] as const,
  event: (config: RuntimeConfig, id: string) => [...base(config), "event", id] as const,
  bans: (config: RuntimeConfig) => [...base(config), "bans"] as const,
  policies: (config: RuntimeConfig) => [...base(config), "policies"] as const,
};
