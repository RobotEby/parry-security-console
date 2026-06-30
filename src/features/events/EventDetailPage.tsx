import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useEventQuery } from "@/lib/api/hooks";
import { EventDetails } from "./ThreatEventDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, isError, error } = useEventQuery(id);

  return (
    <div className="space-y-4 max-w-3xl">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" /> Back to events
      </Link>
      {isLoading ? <Skeleton className="h-96" /> : null}
      {isError ? <ErrorState title="Failed to load event" description={error.message} /> : null}
      {!isLoading && !isError && !event ? (
        <EmptyState title="Event not found" description={`No event with id ${id}.`} />
      ) : null}
      {event ? (
        <div className="rounded-lg border border-border bg-card p-5">
          <h1 className="text-lg font-semibold font-mono mb-4">{event.type}</h1>
          <EventDetails event={event} />
        </div>
      ) : null}
    </div>
  );
}
