import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ThreatEventTable } from "./ThreatEventTable";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITIES } from "@/lib/utils/severity";
import { useEventsQuery } from "@/lib/api/hooks";
import { ErrorState } from "@/components/ui/error-state";
import { useEventFilters } from "./useEventFilters";
import type { EventFiltersSearch } from "./eventFilters";

export function EventsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Threat Events</h1>
        <p className="text-sm text-muted-foreground">
          Blocked and monitored requests detected by Parry.
        </p>
      </div>
      <Filters />
      <EventsBody />
    </div>
  );
}

function Filters() {
  const { filters, update } = useEventFilters();
  return (
    <div className="rounded-lg border border-border bg-card p-3 grid gap-2 md:grid-cols-6">
      <div className="relative md:col-span-2">
        <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search type, reason, IP, path, request id…"
          value={filters.q ?? ""}
          onChange={(e) => update({ q: e.target.value || undefined })}
          className="w-full h-9 rounded-md bg-surface-1 border border-border pl-8 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
      <Select
        value={filters.severity ?? ""}
        onChange={(v) => update({ severity: (v || undefined) as EventFiltersSearch["severity"] })}
        options={[
          { value: "", label: "All severities" },
          ...SEVERITIES.map((s) => ({ value: s, label: s })),
        ]}
      />
      <Select
        value={filters.action ?? ""}
        onChange={(v) => update({ action: v || undefined })}
        options={[
          { value: "", label: "All actions" },
          { value: "blocked", label: "blocked" },
          { value: "monitored", label: "monitored" },
          { value: "rate_limited", label: "rate_limited" },
        ]}
      />
      <input
        type="text"
        placeholder="Path contains…"
        value={filters.path ?? ""}
        onChange={(e) => update({ path: e.target.value || undefined })}
        className="h-9 rounded-md bg-surface-1 border border-border px-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
      <input
        type="text"
        placeholder="IP contains…"
        value={filters.ip ?? ""}
        onChange={(e) => update({ ip: e.target.value || undefined })}
        className="h-9 rounded-md bg-surface-1 border border-border px-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md bg-surface-1 border border-border px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function EventsBody() {
  const { filters, setPage } = useEventFilters();
  const { data, isLoading, isError, error } = useEventsQuery(filters);

  if (isLoading) return <Skeleton className="h-72" />;
  if (isError) return <ErrorState title="Failed to load events" description={error.message} />;
  if (!data) return null;

  const { limit, offset } = filters;
  const total = data.pagination.total;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + limit, total);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-3 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <span className="text-foreground">
            {start}-{end}
          </span>{" "}
          of <span className="text-foreground">{total}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => setPage(Math.max(0, offset - limit))}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-1 px-2 py-1 disabled:opacity-40 hover:bg-surface-2"
          >
            <ChevronLeft className="size-3" /> Prev
          </button>
          <button
            type="button"
            disabled={offset + limit >= total}
            onClick={() => setPage(offset + limit)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-1 px-2 py-1 disabled:opacity-40 hover:bg-surface-2"
          >
            Next <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
      <ThreatEventTable events={data.data} />
    </div>
  );
}
