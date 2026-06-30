import type { z } from "zod";
import type { ApiConfig, ApiMode, RuntimeConfig } from "@/lib/config/runtime-config";
import type {
  apiErrorSchema,
  banSchema,
  bansResponseSchema,
  eventActionSchema,
  eventsResponseSchema,
  healthSchema,
  metricsSchema,
  policiesResponseSchema,
  policySchema,
  severitySchema,
  threatEventSchema,
} from "./schemas";

export type Severity = z.infer<typeof severitySchema>;
export type EventAction = z.infer<typeof eventActionSchema>;
export type HealthResponse = z.infer<typeof healthSchema>;
export type MetricsResponse = z.infer<typeof metricsSchema>;
export type ThreatEvent = z.infer<typeof threatEventSchema>;
export type EventsListResponse = z.infer<typeof eventsResponseSchema>;
export type BanEntry = z.infer<typeof banSchema>;
export type BansResponse = z.infer<typeof bansResponseSchema>;
export type PolicyEntry = z.infer<typeof policySchema>;
export type PoliciesResponse = z.infer<typeof policiesResponseSchema>;
export type ErrorResponse = z.infer<typeof apiErrorSchema>;
export type DetectorName = string;

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

export type { ApiConfig, ApiMode, RuntimeConfig };
