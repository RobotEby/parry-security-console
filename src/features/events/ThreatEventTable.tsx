import { useState } from "react";
import type { ThreatEvent } from "@/lib/api/types";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Badge } from "@/components/ui/badge";
import { actionClasses } from "@/lib/utils/severity";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { ThreatEventDrawer } from "./ThreatEventDrawer";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldAlert } from "lucide-react";
import { normalizeDetectorLabel } from "@/lib/api/detectors";

export function ThreatEventTable({
  events,
  compact = false,
}: {
  events: ThreatEvent[];
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<ThreatEvent | null>(null);

  if (events.length === 0) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No threat events"
        description="Nothing has been blocked or monitored in this window."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Severity</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Action</th>
              {!compact && <th className="px-3 py-2 font-medium">Detector</th>}
              <th className="px-3 py-2 font-medium">Method</th>
              <th className="px-3 py-2 font-medium">Path</th>
              <th className="px-3 py-2 font-medium">IP</th>
              {!compact && <th className="px-3 py-2 font-medium">Policy</th>}
              {!compact && <th className="px-3 py-2 font-medium">Request</th>}
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr
                key={e.id}
                onClick={() => setSelected(e)}
                className="border-b border-border/60 hover:bg-surface-2/60 cursor-pointer"
              >
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {timeAgo(e.timestamp)}
                </td>
                <td className="px-3 py-2">
                  <SeverityBadge severity={e.severity} />
                </td>
                <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{e.type}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs",
                      actionClasses(e.action),
                    )}
                  >
                    {e.action}
                  </span>
                </td>
                {!compact && (
                  <td className="px-3 py-2 text-muted-foreground">{normalizeDetectorLabel(e)}</td>
                )}
                <td className="px-3 py-2">
                  {e.method ? (
                    <Badge variant="outline" className="font-mono">
                      {e.method}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs truncate max-w-[240px]">
                  {e.path ?? "—"}
                </td>
                <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{e.ip ?? "—"}</td>
                {!compact && (
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {e.policyName ?? "—"}
                  </td>
                )}
                {!compact && (
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                    {e.requestId ?? "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ThreatEventDrawer event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
