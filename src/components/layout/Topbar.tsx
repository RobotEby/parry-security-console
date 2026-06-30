import { Menu } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { useHealthQuery } from "@/lib/api/hooks";
import { useRuntimeConfig } from "@/lib/hooks/useRuntimeConfig";
import { ParryUnauthorizedError } from "@/lib/api/client";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const config = useRuntimeConfig();
  const health = useHealthQuery();
  const mock = config.mode === "mock";

  let status: "connected" | "disconnected" | "unauthorized" | "mock";
  if (mock) status = "mock";
  else if (health.isSuccess) status = "connected";
  else if (health.error instanceof ParryUnauthorizedError) status = "unauthorized";
  else status = health.isLoading ? "connected" : "disconnected";

  const store = health.data?.store;

  return (
    <header className="h-14 border-b border-border bg-surface-1 flex items-center gap-3 px-4 sticky top-0 z-30">
      <button
        type="button"
        onClick={onOpenMenu}
        className="lg:hidden size-9 rounded-md border border-border flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </button>
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-semibold text-sm">Parry Security Console</span>
        <span className="text-xs text-muted-foreground hidden sm:inline truncate">
          Application-layer security telemetry
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {store ? (
          <Badge variant="outline" className="font-normal">
            {store === "redis" ? "Redis Store" : "Memory Store"}
          </Badge>
        ) : null}
        <StatusBadge status={status} />
      </div>
    </header>
  );
}
