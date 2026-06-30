import {
  Activity,
  AlertOctagon,
  Ban,
  Database,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Zap,
} from "lucide-react";
import { useEventsQuery, useMetricsQuery } from "@/lib/api/hooks";
import { MetricCard } from "@/components/ui/metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityChart } from "@/components/charts/SeverityChart";
import { DetectorChart } from "@/components/charts/DetectorChart";
import { RequestsChart } from "@/components/charts/RequestsChart";
import { ThreatEventTable } from "@/features/events/ThreatEventTable";
import { formatNumber, formatUptime } from "@/lib/utils/format";
import { ErrorState } from "@/components/ui/error-state";

export function DashboardPage() {
  const metrics = useMetricsQuery();
  const events = useEventsQuery({ limit: 10 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live application-layer telemetry from the Parry Admin API.
        </p>
      </div>

      {metrics.isLoading || events.isLoading ? <DashboardSkeleton /> : null}
      {metrics.isError ? (
        <ErrorState title="Failed to load metrics" description={metrics.error.message} />
      ) : null}
      {events.isError ? (
        <ErrorState title="Failed to load events" description={events.error.message} />
      ) : null}

      {metrics.data && events.data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Total Requests"
              value={formatNumber(metrics.data.totalRequests)}
              icon={Activity}
            />
            <MetricCard
              label="Allowed"
              value={formatNumber(metrics.data.allowedRequests)}
              icon={ShieldCheck}
              accent="success"
            />
            <MetricCard
              label="Blocked Requests"
              value={formatNumber(metrics.data.blockedRequests)}
              icon={ShieldAlert}
              accent="danger"
            />
            <MetricCard
              label="Rate Limited"
              value={formatNumber(metrics.data.rateLimitedRequests)}
              icon={Zap}
              accent="warning"
            />
            <MetricCard
              label="Brute Force Blocks"
              value={formatNumber(metrics.data.bruteForceBlocks)}
              icon={AlertOctagon}
              accent="danger"
            />
            <MetricCard
              label="Active Bans"
              value={formatNumber(metrics.data.activeBans)}
              icon={Ban}
              accent="danger"
            />
            <MetricCard label="Uptime" value={formatUptime(metrics.data.uptimeMs)} icon={Timer} />
            <MetricCard
              label="Store"
              value={
                Object.keys(metrics.data.eventsByType).length > 0
                  ? `${Object.keys(metrics.data.eventsByType).length} event types`
                  : "—"
              }
              icon={Database}
              hint="Detection coverage"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-3">
            <Panel title="Events by severity">
              <SeverityChart data={metrics.data.eventsBySeverity} />
            </Panel>
            <Panel title="Events by detector">
              <DetectorChart data={metrics.data.eventsByDetector} />
            </Panel>
            <Panel title="Request outcomes">
              <RequestsChart
                allowed={metrics.data.allowedRequests}
                blocked={metrics.data.blockedRequests}
                rateLimited={metrics.data.rateLimitedRequests}
              />
            </Panel>
          </div>

          <Panel title="Recent threat events" icon={Gauge}>
            <ThreatEventTable events={events.data.data} compact />
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  className = "",
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: typeof Gauge;
}) {
  return (
    <section className={`rounded-lg border border-border bg-card ${className}`}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border">
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
        <h2 className="text-sm font-medium">{title}</h2>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
