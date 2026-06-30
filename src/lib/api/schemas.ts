import { z } from "zod";

export const severitySchema = z.enum(["low", "medium", "high", "critical"]);
export const eventActionSchema = z.enum([
  "allowed",
  "blocked",
  "monitored",
  "observed",
  "rate_limited",
  "banned",
  "reset",
  "error",
  "unknown",
]);

const numberDefault = (value = 0) => z.coerce.number().finite().catch(value).default(value);
const recordOfNumbers = z.record(z.coerce.number().finite().catch(0)).catch({}).default({});
const paginationSchema = z
  .object({
    limit: z.coerce.number().int().positive().catch(25).default(25),
    offset: z.coerce.number().int().min(0).catch(0).default(0),
    total: z.coerce.number().int().min(0).catch(0).default(0),
  })
  .catch({ limit: 25, offset: 0, total: 0 })
  .default({ limit: 25, offset: 0, total: 0 });

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function toOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function toIsoString(value: unknown, fallback = new Date(0).toISOString()) {
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  return fallback;
}

function maybeIsoString(value: unknown) {
  if (value === null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString();
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  return undefined;
}

function toOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function isIpLike(value: string) {
  return (
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value) ||
    /^ip:[^\s]+$/i.test(value) ||
    /^[0-9a-f:]+$/i.test(value)
  );
}

function inferBanType(key: string, metadata: Record<string, unknown>, explicit?: unknown) {
  if (typeof explicit === "string" && explicit.trim()) return explicit;
  const source =
    `${key} ${String(metadata.type ?? "")} ${String(metadata.keyType ?? "")}`.toLowerCase();
  if (source.includes("bf:") || source.includes("brute-force")) return "brute-force";
  if (source.includes("body.email") || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(source)) {
    return "identity";
  }
  if (isIpLike(key)) return "ip";
  return "generic";
}

function normalizeBanKey(key: string, type: string) {
  if (type === "ip" && !key.startsWith("ip:")) return `ip:${key}`;
  return key;
}

function normalizeBanInput(value: unknown) {
  const input = toRecord(value);
  const metadata = toRecord(input.metadata);
  const key = toStringValue(input.key, "unknown");
  const type = inferBanType(key, metadata, input.type);
  const createdAt = toIsoString(input.createdAt ?? metadata.createdAt);
  const expiresAt = maybeIsoString(input.expiresAt ?? input.banExpiresAt ?? metadata.expiresAt);
  const explicitTtl = toOptionalNumber(input.ttlMs ?? metadata.ttlMs);
  const ttlMs =
    explicitTtl ??
    (expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : undefined);

  return {
    key: normalizeBanKey(key, type),
    type,
    reason: toOptionalString(input.reason ?? metadata.reason),
    policyName: toOptionalString(input.policyName ?? metadata.policyName),
    createdAt,
    expiresAt,
    ttlMs,
  };
}

export const healthSchema = z.object({
  ok: z.boolean().catch(false).default(false),
  name: z.string().catch("parry").default("parry"),
  version: z.string().catch("unknown").default("unknown"),
  uptimeMs: numberDefault(0),
  store: z.string().catch("memory").default("memory"),
});

export const metricsSchema = z.object({
  startedAt: z
    .string()
    .catch(() => new Date(0).toISOString())
    .default(new Date(0).toISOString()),
  uptimeMs: numberDefault(0),
  totalRequests: numberDefault(0),
  allowedRequests: numberDefault(0),
  blockedRequests: numberDefault(0),
  rateLimitedRequests: numberDefault(0),
  bruteForceBlocks: numberDefault(0),
  activeBans: numberDefault(0),
  eventsByType: recordOfNumbers,
  eventsBySeverity: recordOfNumbers,
  eventsByDetector: recordOfNumbers,
  eventsByAction: recordOfNumbers,
});

export const threatEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  module: z.string().optional(),
  detector: z.string().optional(),
  detectorSlug: z.string().optional(),
  detectorType: z.string().optional(),
  severity: severitySchema,
  action: eventActionSchema.catch("unknown").default("unknown"),
  reason: z.string().optional(),
  ip: z.string().optional(),
  method: z.string().optional(),
  path: z.string().optional(),
  statusCode: z.coerce.number().int().optional(),
  policyName: z.string().optional(),
  keyTypes: z.array(z.string()).optional(),
  requestId: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string(),
  metadata: z.record(z.unknown()).catch({}).default({}),
});

export const eventsResponseSchema = z.object({
  data: z.array(threatEventSchema).catch([]).default([]),
  pagination: paginationSchema,
});

export const banSchema = z.preprocess(
  normalizeBanInput,
  z.object({
    key: z.string(),
    type: z.string(),
    reason: z.string().optional(),
    policyName: z.string().optional(),
    createdAt: z.string(),
    expiresAt: z.string().optional(),
    ttlMs: z.coerce.number().optional(),
  }),
);

export const bansResponseSchema = z.object({
  data: z.array(banSchema).catch([]).default([]),
  pagination: paginationSchema,
});

export const policySchema = z.object({
  name: z.string(),
  match: z
    .object({
      method: z.union([z.string(), z.array(z.string())]).optional(),
      path: z.union([z.string(), z.array(z.string())]).optional(),
    })
    .optional(),
  rateLimit: z
    .object({
      enabled: z.boolean().optional(),
      max: z.coerce.number().optional(),
      windowMs: z.coerce.number().optional(),
      key: z.string().optional(),
    })
    .optional(),
  bruteForce: z
    .object({
      enabled: z.boolean().optional(),
      maxAttempts: z.coerce.number().optional(),
      windowMs: z.coerce.number().optional(),
      blockDurationMs: z.coerce.number().optional(),
      keys: z.array(z.string()).optional(),
      resetOnSuccess: z.boolean().optional(),
    })
    .optional(),
});

export const policiesResponseSchema = z.object({
  data: z.array(policySchema).catch([]).default([]),
  pagination: paginationSchema,
});

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});
