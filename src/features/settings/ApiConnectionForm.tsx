import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  clearRuntimeConfig,
  getRuntimeConfig,
  saveRuntimeConfig,
} from "@/lib/config/runtime-config";
import { getHealthWithConfig } from "@/lib/api/parry-api";
import { ParryUnauthorizedError } from "@/lib/api/client";

type TestState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; version: string; store: string }
  | { kind: "error"; message: string; unauthorized?: boolean };

export function ApiConnectionForm() {
  const initial = getRuntimeConfig();
  const [apiUrl, setApiUrl] = useState(initial.apiUrl);
  const [token, setToken] = useState(initial.adminToken ?? "");
  const [tokenIsMasked, setTokenIsMasked] = useState(Boolean(initial.adminToken));
  const [test, setTest] = useState<TestState>({ kind: "idle" });
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  async function onTest() {
    const cleanApiUrl = apiUrl.trim();
    const cleanToken = token.trim();
    setTest({ kind: "loading" });
    try {
      const health = await getHealthWithConfig({
        apiUrl: cleanApiUrl,
        adminToken: cleanToken || undefined,
      });
      setTest({ kind: "ok", version: health.version, store: health.store });
    } catch (error) {
      const unauthorized = error instanceof ParryUnauthorizedError;
      setTest({
        kind: "error",
        unauthorized,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  function onSave() {
    saveRuntimeConfig({ apiUrl: apiUrl.trim(), adminToken: token.trim() || undefined });
    setSaved(true);
    setTokenIsMasked(Boolean(token.trim()));
    queryClient.invalidateQueries({ queryKey: ["parry"] });
  }

  function onClear() {
    clearRuntimeConfig();
    setApiUrl("");
    setToken("");
    setTokenIsMasked(false);
    setTest({ kind: "idle" });
    queryClient.invalidateQueries({ queryKey: ["parry"] });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <Field
        label="Admin API URL"
        hint="Example: http://localhost:3000/_parry — leave empty to use mock data."
      >
        <input
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="http://localhost:3000/_parry"
          className="w-full h-10 rounded-md bg-surface-1 border border-border px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </Field>

      <Field label="Admin Token" hint="Sent as x-parry-admin-token. Never displayed after save.">
        {tokenIsMasked && token ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value="••••••••••••"
              className="flex-1 h-10 rounded-md bg-surface-1 border border-border px-3 text-sm font-mono text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => {
                setToken("");
                setTokenIsMasked(false);
              }}
              className="h-10 px-3 rounded-md border border-border bg-surface-1 text-xs hover:bg-surface-2"
            >
              Replace
            </button>
          </div>
        ) : (
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="paste admin token"
            autoComplete="off"
            className="w-full h-10 rounded-md bg-surface-1 border border-border px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onTest}
          disabled={!apiUrl || test.kind === "loading"}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-2 text-sm font-medium hover:bg-surface-2 disabled:opacity-50"
        >
          {test.kind === "loading" ? <Loader2 className="size-4 animate-spin" /> : null}
          Test connection
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Save locally
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-2 text-sm font-medium hover:bg-surface-2"
        >
          Clear settings
        </button>
        {saved ? <span className="text-xs text-[color:var(--success)]">Saved.</span> : null}
      </div>

      {test.kind === "ok" ? (
        <div className="flex items-center gap-2 text-xs text-[color:var(--success)]">
          <CheckCircle2 className="size-4" />
          Reachable — v{test.version}, store: {test.store}.
        </div>
      ) : null}
      {test.kind === "error" ? (
        <div className="flex items-start gap-2 text-xs text-destructive">
          <XCircle className="size-4 mt-0.5" />
          <span>{test.unauthorized ? "Unauthorized — check the admin token." : test.message}</span>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
