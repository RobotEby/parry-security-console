import { Shield } from "lucide-react";
import { usePoliciesQuery } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";

export function PoliciesPage() {
  const { data, isLoading, isError, error } = usePoliciesQuery();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Route Policies</h1>
        <p className="text-sm text-muted-foreground">
          Configured policies and their enforcement parameters.
        </p>
      </div>
      {isLoading ? <Skeleton className="h-72" /> : null}
      {isError ? <ErrorState title="Failed to load policies" description={error.message} /> : null}
      {data?.data.length === 0 ? <EmptyState icon={Shield} title="No policies configured" /> : null}
      {data && data.data.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-3">
          {data.data.map((policy) => (
            <article
              key={policy.name}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              <header className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-sm">{policy.name}</h2>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {policy.match?.method ? (
                    <Badge variant="outline" className="font-mono">
                      {String(policy.match.method)}
                    </Badge>
                  ) : null}
                  {policy.match?.path ? (
                    <Badge variant="outline" className="font-mono">
                      {String(policy.match.path)}
                    </Badge>
                  ) : null}
                </div>
              </header>
              <Section title="Rate limit">
                {policy.rateLimit?.enabled ? (
                  <KV
                    rows={[
                      ["max", String(policy.rateLimit.max ?? "—")],
                      ["window", `${(policy.rateLimit.windowMs ?? 0) / 1000}s`],
                      ["key", policy.rateLimit.key ?? "—"],
                    ]}
                  />
                ) : (
                  <Disabled />
                )}
              </Section>
              <Section title="Brute force">
                {policy.bruteForce?.enabled ? (
                  <KV
                    rows={[
                      ["max attempts", String(policy.bruteForce.maxAttempts ?? "—")],
                      ["window", `${(policy.bruteForce.windowMs ?? 0) / 1000}s`],
                      ["block for", `${(policy.bruteForce.blockDurationMs ?? 0) / 1000}s`],
                      ["reset on success", policy.bruteForce.resetOnSuccess ? "yes" : "no"],
                    ]}
                  />
                ) : (
                  <Disabled />
                )}
                {policy.bruteForce?.enabled && policy.bruteForce.keys?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {policy.bruteForce.keys.map((key) => (
                      <Badge key={key} variant="outline" className="font-mono">
                        {key}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </Section>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {title}
      </div>
      {children}
    </div>
  );
}

function KV({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-mono">
      {rows.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-muted-foreground">{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Disabled() {
  return <span className="text-xs text-muted-foreground italic">disabled</span>;
}
