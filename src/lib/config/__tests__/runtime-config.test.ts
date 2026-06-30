import { beforeEach, describe, expect, it } from "vitest";
import { clearRuntimeConfig, getRuntimeConfig, saveRuntimeConfig } from "../runtime-config";

describe("runtime config", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("uses mock mode when no apiUrl is configured", () => {
    clearRuntimeConfig();
    expect(getRuntimeConfig().mode).toBe("mock");
  });

  it("keeps Vitest in mock mode through empty .env.test values", () => {
    clearRuntimeConfig();

    expect(import.meta.env.VITE_PARRY_API_URL).toBe("");
    expect(import.meta.env.VITE_PARRY_ADMIN_TOKEN).toBe("");
    expect(getRuntimeConfig()).toMatchObject({
      apiUrl: "",
      adminToken: undefined,
      mode: "mock",
      source: "mock",
    });
  });

  it("uses remote mode when apiUrl is saved", () => {
    saveRuntimeConfig({ apiUrl: "http://localhost:3000/_parry", adminToken: "token" });
    expect(getRuntimeConfig()).toMatchObject({
      mode: "remote",
      source: "localStorage",
      apiUrl: "http://localhost:3000/_parry",
    });
  });

  it("reads the legacy Parry Console storage key", () => {
    window.localStorage.setItem(
      "parry-console:config",
      JSON.stringify({ apiUrl: "http://localhost:3000/_parry", adminToken: "token" }),
    );

    expect(getRuntimeConfig()).toMatchObject({
      mode: "remote",
      source: "localStorage",
      apiUrl: "http://localhost:3000/_parry",
      adminToken: "token",
    });
  });

  it("clears current and legacy storage keys", () => {
    window.localStorage.setItem("parry-security-console:config", "{}");
    window.localStorage.setItem("parry-console:config", "{}");

    clearRuntimeConfig();

    expect(window.localStorage.getItem("parry-security-console:config")).toBeNull();
    expect(window.localStorage.getItem("parry-console:config")).toBeNull();
  });
});
