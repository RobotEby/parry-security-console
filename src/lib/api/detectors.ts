import type { ThreatEvent } from "./types";

const detectorAliases: Record<string, string> = {
  sql: "sql",
  sqli: "sql",
  sql_injection: "sql",
  xss: "xss",
  nosql: "nosql",
  nosql_injection: "nosql",
  hpp: "hpp",
  http_parameter_pollution: "hpp",
  "prototype-pollution": "prototype-pollution",
  prototype_pollution: "prototype-pollution",
  "path-traversal": "path-traversal",
  path_traversal: "path-traversal",
  "request-shape": "request-shape",
  request_shape: "request-shape",
  "rate-limit": "rate-limit",
  rate_limit: "rate-limit",
  ratelimit: "rate-limit",
  route_rate_limit: "rate-limit",
  "brute-force": "brute-force",
  brute_force: "brute-force",
  bruteforce: "brute-force",
  pathtraversal: "path-traversal",
  prototype: "prototype-pollution",
};

const detectorLabels: Record<string, string> = {
  sql: "SQL Injection",
  xss: "XSS",
  nosql: "NoSQL Injection",
  hpp: "HPP",
  "prototype-pollution": "Prototype Pollution",
  "path-traversal": "Path Traversal",
  "request-shape": "Request Shape",
  "rate-limit": "Rate Limit",
  "brute-force": "Brute Force",
};

function normalizeValue(value?: string) {
  if (!value) return undefined;
  const normalized = value.trim().replace(/\s+/g, "_").replace(/-/g, "_").toLowerCase();
  return detectorAliases[normalized] ?? detectorAliases[value.trim().toLowerCase()];
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeDetectorSlug(
  event: Pick<ThreatEvent, "detector" | "detectorSlug" | "detectorType" | "module">,
) {
  return (
    normalizeValue(event.detector) ??
    normalizeValue(event.detectorSlug) ??
    normalizeValue(event.detectorType) ??
    normalizeValue(event.module)
  );
}

export function normalizeDetectorLabel(
  event: Pick<ThreatEvent, "detector" | "detectorSlug" | "detectorType" | "module">,
) {
  const slug = normalizeDetectorSlug(event);
  if (slug) return detectorLabels[slug] ?? titleCase(slug);

  const fallback = event.detector ?? event.detectorSlug ?? event.detectorType ?? event.module;
  return fallback ? titleCase(fallback) : "—";
}
