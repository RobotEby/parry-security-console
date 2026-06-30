import { useEffect, useState } from "react";
import {
  getRuntimeConfig,
  subscribeToConfigChanges,
  type RuntimeConfig,
} from "@/lib/config/runtime-config";

export function useRuntimeConfig(): RuntimeConfig {
  const [config, setConfig] = useState<RuntimeConfig>(() => getRuntimeConfig());

  useEffect(() => subscribeToConfigChanges(() => setConfig(getRuntimeConfig())), []);

  return config;
}
