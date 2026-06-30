import { HeartPulse, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useHealthQuery } from "@/lib/api/hooks";
import { parryQueryKeys } from "@/lib/api/query-keys";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatUptime } from "@/lib/utils/format";
import { useRuntimeConfig } from "@/lib/hooks/useRuntimeConfig";
import { ParryUnauthorizedError } from "@/lib/api/client";
import { ErrorState } from "@/components/ui/error-state";

export function HealthPage() {
  const config = useRuntimeConfig();
  const queryClient = useQueryClient();
  const health = useHealthQuery();
  const mock = config.mode === "mock";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Admin API Health</h1>
          <p className="text-sm text-muted-foreground">Connectivity and runtime status.</p>
        </div>
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries({ queryKey: parryQueryKeys.health(config) })}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5 text-xs hover:bg-surface-2"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>
      {health.isLoading ? <Skeleton className="h-48" /> : null}
      {health.isError ? (
        <ErrorState
          title={
            health.error instanceof ParryUnauthorizedError
              ? "Unauthorized"
              : "Admin API unreachable"
          }
          description={
            health.error instanceof ParryUnauthorizedError
              ? "The admin token was rejected."
              : health.error.message
          }
          variant={health.error instanceof ParryUnauthorizedError ? "unauthorized" : "offline"}
        />
      ) : null}
      {health.data ? (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="size-10 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
              <HeartPulse className="size-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">
                {health.data.name}{" "}
                <span className="text-muted-foreground font-normal">v{health.data.version}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {mock ? "Mock data — configure VITE_PARRY_API_URL or use Settings." : config.apiUrl}
              </div>
            </div>
            <div className="ml-auto">
              <StatusBadge status={mock ? "mock" : "connected"} />
            </div>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="OK">
              {health.data.ok ? (
                <Badge variant="outline">true</Badge>
              ) : (
                <Badge variant="destructive">false</Badge>
              )}
            </Stat>
            <Stat label="Store">
              {health.data.store === "redis" ? "Redis Store" : "Memory Store"}
            </Stat>
            <Stat label="Uptime">{formatUptime(health.data.uptimeMs)}</Stat>
            <Stat label="Mode">{mock ? "Demo Mode" : "Live"}</Stat>
          </dl>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Parry protects the application layer. Volumetric DDoS is the responsibility of CloudFront,
        AWS WAF, AWS Shield, your CDN, or the load balancer in front of the application.
      </p>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div>{children}</div>
    </div>
  );
}
