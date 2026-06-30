import { Ban } from "lucide-react";
import { useBansQuery } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { timeAgo, timeUntil } from "@/lib/utils/format";
import { ErrorState } from "@/components/ui/error-state";

export function BansPage() {
  const { data, isLoading, isError, error } = useBansQuery();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Active Bans</h1>
        <p className="text-sm text-muted-foreground">Read-only view of currently enforced bans.</p>
      </div>
      {isLoading ? <Skeleton className="h-72" /> : null}
      {isError ? <ErrorState title="Failed to load bans" description={error.message} /> : null}
      {data?.data.length === 0 ? (
        <EmptyState
          icon={Ban}
          title="No active bans"
          description="Parry is not enforcing any bans right now."
        />
      ) : null}
      {data && data.data.length > 0 ? (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-2 font-medium">Key</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Policy</th>
                <th className="px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((ban) => (
                <tr key={ban.key} className="border-b border-border/60">
                  <td className="px-3 py-2 font-mono text-xs break-all">{ban.key}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="font-mono">
                      {ban.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{ban.reason ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {ban.policyName ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {timeAgo(ban.createdAt)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {ban.expiresAt ? (
                      <span className="text-[color:var(--warning)]">
                        {timeUntil(ban.expiresAt)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
