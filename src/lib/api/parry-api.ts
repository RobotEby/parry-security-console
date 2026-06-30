import { parryFetch, parryFetchWithConfig } from "./client";
import { getRuntimeConfig, type ApiConfig } from "@/lib/config/runtime-config";
import {
  bansResponseSchema,
  eventsResponseSchema,
  healthSchema,
  metricsSchema,
  policiesResponseSchema,
  threatEventSchema,
} from "./schemas";
import type {
  BanEntry,
  BansResponse,
  EventsListResponse,
  HealthResponse,
  MetricsResponse,
  PoliciesResponse,
  PolicyEntry,
  ThreatEvent,
} from "./types";
import {
  mockBans,
  mockEvent,
  mockEvents,
  mockHealth,
  mockMetrics,
  mockPolicies,
  type EventFilters,
} from "./mocks";

const delay = (ms = 120) => new Promise((resolve) => window.setTimeout(resolve, ms));

function isMockMode() {
  return getRuntimeConfig().mode === "mock";
}

export async function getHealth(): Promise<HealthResponse> {
  if (isMockMode()) {
    await delay();
    return healthSchema.parse(mockHealth());
  }
  return parryFetch("/health", healthSchema);
}

export async function getHealthWithConfig(config: ApiConfig): Promise<HealthResponse> {
  return parryFetchWithConfig(config, "/health", healthSchema);
}

export async function getMetrics(): Promise<MetricsResponse> {
  if (isMockMode()) {
    await delay();
    return metricsSchema.parse(mockMetrics());
  }
  return parryFetch("/metrics", metricsSchema);
}

export async function getEvents(filters: EventFilters = {}): Promise<EventsListResponse> {
  if (isMockMode()) {
    await delay();
    return eventsResponseSchema.parse(mockEvents(filters));
  }
  return parryFetch("/events", eventsResponseSchema, { query: filters });
}

export async function getEventById(id: string): Promise<ThreatEvent | null> {
  if (isMockMode()) {
    await delay();
    const event = mockEvent(id);
    return event ? threatEventSchema.parse(event) : null;
  }
  return parryFetch(`/events/${encodeURIComponent(id)}`, threatEventSchema);
}

export async function getBans(): Promise<BansResponse> {
  if (isMockMode()) {
    await delay();
    return bansResponseSchema.parse(mockBans());
  }
  return parryFetch("/bans", bansResponseSchema);
}

export async function getPolicies(): Promise<PoliciesResponse> {
  if (isMockMode()) {
    await delay();
    return policiesResponseSchema.parse(mockPolicies());
  }
  return parryFetch("/policies", policiesResponseSchema);
}

// Backward-compatible names from the generated prototype.
export const listEvents = getEvents;
export const getEvent = getEventById;
export const listBans = getBans;
export const listPolicies = getPolicies;

export type { BanEntry, EventFilters, HealthResponse, MetricsResponse, PolicyEntry, ThreatEvent };
