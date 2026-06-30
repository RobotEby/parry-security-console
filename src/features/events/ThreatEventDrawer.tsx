import { Link } from "react-router-dom";
import { X } from "lucide-react";
import type { ThreatEvent } from "@/lib/api/types";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Badge } from "@/components/ui/badge";
import { actionClasses } from "@/lib/utils/severity";
import { cn } from "@/lib/utils";
import { JsonPreview } from "@/components/ui/json-preview";
import { normalizeDetectorLabel } from "@/lib/api/detectors";

export function ThreatEventDrawer({
  event,
  onClose,
}: {
  event: ThreatEvent | null;
  onClose: () => void;
}) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col">
        <header className="h-14 px-4 flex items-center gap-3 border-b border-border">
          <SeverityBadge severity={event.severity} />
          <span className="font-mono text-sm truncate">{event.type}</span>
          <div className="flex-1" />
          <Link
            to={`/events/${encodeURIComponent(event.id)}`}
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Open page
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-md border border-border flex items-center justify-center"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <EventDetails event={event} />
        </div>
      </div>
    </div>
  );
}

export function EventDetails({ event }: { event: ThreatEvent }) {
  const timestamp = Number.isNaN(new Date(event.timestamp).getTime())
    ? event.timestamp
    : new Date(event.timestamp).toISOString();
  return (
    <div className="space-y-4">
      <Field label="Reason">{event.reason ?? "—"}</Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Action">
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-xs",
              actionClasses(event.action),
            )}
          >
            {event.action}
          </span>
        </Field>
        <Field label="Status">
          {event.statusCode ? <Badge variant="outline">{event.statusCode}</Badge> : "—"}
        </Field>
        <Field label="Method">{event.method ?? "—"}</Field>
        <Field label="Path">
          <Mono>{event.path ?? "—"}</Mono>
        </Field>
        <Field label="IP">
          <Mono>{event.ip ?? "—"}</Mono>
        </Field>
        <Field label="Detector">{normalizeDetectorLabel(event)}</Field>
        <Field label="Policy">{event.policyName ?? "—"}</Field>
        <Field label="Request ID">
          <Mono>{event.requestId ?? "—"}</Mono>
        </Field>
        <Field label="Timestamp">{timestamp}</Field>
        <Field label="User Agent">
          <Mono className="truncate block">{event.userAgent ?? "—"}</Mono>
        </Field>
      </div>
      {event.keyTypes && event.keyTypes.length > 0 ? (
        <Field label="Key types">
          <div className="flex flex-wrap gap-1.5">
            {event.keyTypes.map((key) => (
              <Badge key={key} variant="outline" className="font-mono">
                {key}
              </Badge>
            ))}
          </div>
        </Field>
      ) : null}
      <Field label="Metadata (sanitized)">
        <JsonPreview value={event.metadata ?? {}} />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Mono({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-xs", className)}>{children}</span>;
}
