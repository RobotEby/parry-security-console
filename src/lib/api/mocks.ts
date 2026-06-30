import {
  bansResponseSchema,
  eventsResponseSchema,
  healthSchema,
  metricsSchema,
  policiesResponseSchema,
} from "./schemas";
import type {
  BanEntry,
  EventsListResponse,
  HealthResponse,
  MetricsResponse,
  PolicyEntry,
  ThreatEvent,
} from "./types";

const STARTED_AT = new Date(Date.now() - 1000 * 60 * 73).toISOString();

const baseEvents: ThreatEvent[] = [
  {
    id: "evt_001",
    type: "SQL_INJECTION_BLOCKED",
    module: "detector",
    detector: "sql",
    severity: "high",
    action: "blocked",
    reason: "SQL injection pattern detected in body.email",
    ip: "203.0.113.42",
    method: "POST",
    path: "/login",
    statusCode: 403,
    policyName: "auth-login",
    keyTypes: ["ip", "body.email"],
    requestId: "req_8x21",
    userAgent: "curl/8.4.0",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    metadata: { matchedRule: "union-select", confidence: 0.92 },
  },
  {
    id: "evt_002",
    type: "XSS_BLOCKED",
    module: "detector",
    detector: "xss",
    severity: "medium",
    action: "blocked",
    reason: "Reflected XSS payload in query.q",
    ip: "198.51.100.7",
    method: "GET",
    path: "/search",
    statusCode: 403,
    policyName: "search-default",
    keyTypes: ["ip"],
    requestId: "req_8x22",
    userAgent: "Mozilla/5.0",
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    metadata: { matchedRule: "script-tag" },
  },
  {
    id: "evt_003",
    type: "BRUTE_FORCE_BLOCKED",
    module: "bruteForce",
    detector: "bruteForce",
    severity: "high",
    action: "blocked",
    reason: "Too many authentication attempts",
    ip: "203.0.113.42",
    method: "POST",
    path: "/login",
    statusCode: 429,
    policyName: "auth-login",
    keyTypes: ["ip", "body.email", "ip+body.email"],
    requestId: "req_8x23",
    userAgent: "python-requests/2.31",
    timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    metadata: { attempts: 12, windowMs: 900000 },
  },
  {
    id: "evt_004",
    type: "NOSQL_INJECTION_BLOCKED",
    module: "detector",
    detector: "nosql",
    severity: "critical",
    action: "blocked",
    reason: "Mongo operator injection in body.username",
    ip: "192.0.2.15",
    method: "POST",
    path: "/api/users/find",
    statusCode: 403,
    policyName: "api-default",
    keyTypes: ["ip"],
    requestId: "req_8x24",
    userAgent: "PostmanRuntime/7.36",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    metadata: { operator: "$ne" },
  },
  {
    id: "evt_005",
    type: "RATE_LIMITED",
    module: "rateLimit",
    detector: "rateLimit",
    severity: "low",
    action: "blocked",
    reason: "Rate limit exceeded for ip",
    ip: "198.51.100.55",
    method: "GET",
    path: "/api/products",
    statusCode: 429,
    policyName: "api-default",
    keyTypes: ["ip"],
    requestId: "req_8x25",
    userAgent: "Mozilla/5.0",
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    metadata: { max: 60, windowMs: 60000 },
  },
  {
    id: "evt_006",
    type: "PROTOTYPE_POLLUTION_BLOCKED",
    module: "detector",
    detector: "prototype",
    severity: "critical",
    action: "blocked",
    reason: "__proto__ key detected in JSON body",
    ip: "192.0.2.88",
    method: "PUT",
    path: "/api/settings",
    statusCode: 403,
    policyName: "api-default",
    keyTypes: ["ip"],
    requestId: "req_8x26",
    userAgent: "Mozilla/5.0",
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    metadata: { key: "__proto__" },
  },
  {
    id: "evt_007",
    type: "PATH_TRAVERSAL_BLOCKED",
    module: "detector",
    detector: "pathTraversal",
    severity: "high",
    action: "blocked",
    reason: "Path traversal sequence in query.file",
    ip: "203.0.113.7",
    method: "GET",
    path: "/files",
    statusCode: 403,
    policyName: "files-default",
    keyTypes: ["ip"],
    requestId: "req_8x27",
    userAgent: "curl/8.4.0",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    metadata: { value: "../../etc/passwd" },
  },
  {
    id: "evt_008",
    type: "HPP_BLOCKED",
    module: "detector",
    detector: "hpp",
    severity: "medium",
    action: "monitored",
    reason: "HTTP parameter pollution detected",
    ip: "198.51.100.91",
    method: "GET",
    path: "/api/items",
    statusCode: 200,
    policyName: "api-default",
    keyTypes: ["ip"],
    requestId: "req_8x28",
    userAgent: "Mozilla/5.0",
    timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    metadata: { duplicatedParam: "id" },
  },
  {
    id: "evt_009",
    type: "XSS_BLOCKED",
    module: "detector",
    detector: "xss",
    severity: "medium",
    action: "blocked",
    reason: "Event handler attribute injection",
    ip: "203.0.113.200",
    method: "POST",
    path: "/comments",
    statusCode: 403,
    policyName: "content-default",
    keyTypes: ["ip"],
    requestId: "req_8x29",
    userAgent: "Mozilla/5.0",
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    metadata: { matchedRule: "onerror" },
  },
  {
    id: "evt_010",
    type: "SQL_INJECTION_BLOCKED",
    module: "detector",
    detector: "sql",
    severity: "high",
    action: "blocked",
    reason: "Boolean-based blind SQLi",
    ip: "198.51.100.7",
    method: "GET",
    path: "/api/products",
    statusCode: 403,
    policyName: "api-default",
    keyTypes: ["ip"],
    requestId: "req_8x30",
    userAgent: "sqlmap/1.7",
    timestamp: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
    metadata: { matchedRule: "or-1-1" },
  },
];

const bans: BanEntry[] = [
  {
    key: "ip:203.0.113.42",
    type: "ip",
    reason: "Too many authentication attempts",
    policyName: "auth-login",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 6).toISOString(),
    ttlMs: 600000,
  },
  {
    key: "ip:192.0.2.15",
    type: "ip",
    reason: "Repeated NoSQL injection attempts",
    policyName: "api-default",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 48).toISOString(),
    ttlMs: 2880000,
  },
  {
    key: "ip+body.email:203.0.113.42|attacker@example.com",
    type: "ip+body.email",
    reason: "Brute force on auth endpoint",
    policyName: "auth-login",
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 21).toISOString(),
    ttlMs: 1260000,
  },
];

const policies: PolicyEntry[] = [
  {
    name: "auth-login",
    match: { method: "POST", path: "/login" },
    rateLimit: { enabled: true, max: 20, windowMs: 60000, key: "ip" },
    bruteForce: {
      enabled: true,
      maxAttempts: 5,
      windowMs: 900000,
      blockDurationMs: 600000,
      keys: ["ip", "body.email", "ip+body.email"],
      resetOnSuccess: true,
    },
  },
  {
    name: "api-default",
    match: { path: "/api/*" },
    rateLimit: { enabled: true, max: 60, windowMs: 60000, key: "ip" },
    bruteForce: { enabled: false },
  },
  {
    name: "search-default",
    match: { method: "GET", path: "/search" },
    rateLimit: { enabled: true, max: 30, windowMs: 60000, key: "ip" },
    bruteForce: { enabled: false },
  },
  {
    name: "files-default",
    match: { method: "GET", path: "/files" },
    rateLimit: { enabled: true, max: 10, windowMs: 60000, key: "ip" },
    bruteForce: { enabled: false },
  },
];

export function mockHealth(): HealthResponse {
  return healthSchema.parse({
    ok: true,
    name: "parry",
    version: "1.0.0",
    uptimeMs: Date.now() - new Date(STARTED_AT).getTime(),
    store: "memory",
  });
}

export function mockMetrics(): MetricsResponse {
  const eventsByType: Record<string, number> = {};
  const eventsBySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const eventsByDetector: Record<string, number> = {};
  const eventsByAction: Record<string, number> = {};
  for (const e of baseEvents) {
    eventsByType[e.type] = (eventsByType[e.type] ?? 0) + 1;
    eventsBySeverity[e.severity] = (eventsBySeverity[e.severity] ?? 0) + 1;
    if (e.detector) eventsByDetector[e.detector] = (eventsByDetector[e.detector] ?? 0) + 1;
    eventsByAction[e.action] = (eventsByAction[e.action] ?? 0) + 1;
  }
  const blocked = 412;
  const rateLimited = 88;
  const total = 5230;
  return metricsSchema.parse({
    startedAt: STARTED_AT,
    uptimeMs: Date.now() - new Date(STARTED_AT).getTime(),
    totalRequests: total,
    allowedRequests: total - blocked,
    blockedRequests: blocked,
    rateLimitedRequests: rateLimited,
    bruteForceBlocks: 17,
    activeBans: bans.length,
    eventsByType,
    eventsBySeverity,
    eventsByDetector,
    eventsByAction,
  });
}

export type EventFilters = {
  severity?: string;
  type?: string;
  detector?: string;
  action?: string;
  path?: string;
  ip?: string;
  q?: string;
  limit?: number;
  offset?: number;
};

export function mockEvents(filters: EventFilters = {}): EventsListResponse {
  let data = [...baseEvents];
  if (filters.severity) data = data.filter((e) => e.severity === filters.severity);
  if (filters.type) data = data.filter((e) => e.type === filters.type);
  if (filters.detector) data = data.filter((e) => e.detector === filters.detector);
  if (filters.action) data = data.filter((e) => e.action === filters.action);
  if (filters.path) data = data.filter((e) => (e.path ?? "").includes(filters.path!));
  if (filters.ip) data = data.filter((e) => (e.ip ?? "").includes(filters.ip!));
  if (filters.q) {
    const q = filters.q.toLowerCase();
    data = data.filter((e) =>
      [e.type, e.reason, e.ip, e.path, e.policyName, e.requestId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }
  const total = data.length;
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 50;
  return eventsResponseSchema.parse({
    data: data.slice(offset, offset + limit),
    pagination: { limit, offset, total },
  });
}

export function mockEvent(id: string): ThreatEvent | null {
  return baseEvents.find((e) => e.id === id) ?? null;
}

export function mockBans() {
  return bansResponseSchema.parse({ data: bans });
}

export function mockPolicies() {
  return policiesResponseSchema.parse({ data: policies });
}
