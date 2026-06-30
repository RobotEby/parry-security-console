import { useQuery } from "@tanstack/react-query";
import { useRuntimeConfig } from "@/lib/hooks/useRuntimeConfig";
import { getBans, getEventById, getEvents, getHealth, getMetrics, getPolicies } from "./parry-api";
import { parryQueryKeys } from "./query-keys";
import type { EventFilters } from "./mocks";

export const STALE_TIMES = {
  health: 15_000,
  metrics: 15_000,
  events: 10_000,
  bans: 15_000,
  policies: 60_000,
} as const;

export function useHealthQuery() {
  const config = useRuntimeConfig();
  return useQuery({
    queryKey: parryQueryKeys.health(config),
    queryFn: getHealth,
    staleTime: STALE_TIMES.health,
    retry: false,
  });
}

export function useMetricsQuery() {
  const config = useRuntimeConfig();
  return useQuery({
    queryKey: parryQueryKeys.metrics(config),
    queryFn: getMetrics,
    staleTime: STALE_TIMES.metrics,
    retry: false,
  });
}

export function useEventsQuery(filters: EventFilters) {
  const config = useRuntimeConfig();
  return useQuery({
    queryKey: parryQueryKeys.events(config, filters),
    queryFn: () => getEvents(filters),
    staleTime: STALE_TIMES.events,
    retry: false,
  });
}

export function useEventQuery(id: string | undefined) {
  const config = useRuntimeConfig();
  return useQuery({
    queryKey: parryQueryKeys.event(config, id ?? ""),
    queryFn: () => getEventById(id ?? ""),
    enabled: Boolean(id),
    staleTime: STALE_TIMES.events,
    retry: false,
  });
}

export function useBansQuery() {
  const config = useRuntimeConfig();
  return useQuery({
    queryKey: parryQueryKeys.bans(config),
    queryFn: getBans,
    staleTime: STALE_TIMES.bans,
    retry: false,
  });
}

export function usePoliciesQuery() {
  const config = useRuntimeConfig();
  return useQuery({
    queryKey: parryQueryKeys.policies(config),
    queryFn: getPolicies,
    staleTime: STALE_TIMES.policies,
    retry: false,
  });
}
