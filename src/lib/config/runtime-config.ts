const STORAGE_KEY = "parry-security-console:config";
const LEGACY_STORAGE_KEY = "parry-console:config";
const CONFIG_EVENT = "parry-config-change";

export type ApiMode = "mock" | "remote";
export type RuntimeConfigSource = "env" | "localStorage" | "mock";

export type ApiConfig = {
  apiUrl: string;
  adminToken?: string;
};

export type RuntimeConfig = ApiConfig & {
  mode: ApiMode;
  source: RuntimeConfigSource;
};

type StoredConfig = Partial<ApiConfig>;

const envUrl = (import.meta.env.VITE_PARRY_API_URL as string | undefined)?.trim() ?? "";
const envToken = (import.meta.env.VITE_PARRY_ADMIN_TOKEN as string | undefined)?.trim() ?? "";

function normalizeConfig(config: Partial<ApiConfig>): ApiConfig {
  const apiUrl = config.apiUrl?.trim() ?? "";
  const adminToken = config.adminToken?.trim() || undefined;
  return { apiUrl, adminToken };
}

function readStorage(): StoredConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConfig;
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  const stored = readStorage();
  if (stored && typeof stored.apiUrl === "string") {
    const cfg = normalizeConfig(stored);
    return {
      ...cfg,
      mode: cfg.apiUrl ? "remote" : "mock",
      source: cfg.apiUrl ? "localStorage" : "mock",
    };
  }

  const envConfig = normalizeConfig({ apiUrl: envUrl, adminToken: envToken });
  if (envConfig.apiUrl) {
    return { ...envConfig, mode: "remote", source: "env" };
  }

  return { apiUrl: "", adminToken: undefined, mode: "mock", source: "mock" };
}

export function saveRuntimeConfig(config: ApiConfig): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeConfig(config);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONFIG_EVENT));
}

export function clearRuntimeConfig(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONFIG_EVENT));
}

export function subscribeToConfigChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(CONFIG_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CONFIG_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function isMockMode(): boolean {
  return getRuntimeConfig().mode === "mock";
}

export const getConfig = getRuntimeConfig;
export const setConfig = saveRuntimeConfig;
export const clearConfig = clearRuntimeConfig;
export const subscribeConfig = subscribeToConfigChanges;
