const REDACTED = "[REDACTED]";
const SENSITIVE_KEYS = new Set([
  "password",
  "pass",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "set-cookie",
  "secret",
  "api-key",
  "api_key",
  "x-api-key",
  "parry_admin_token",
]);

function isSensitiveKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return (
    SENSITIVE_KEYS.has(normalized) ||
    /(^|[-_])(token|secret|password|cookie|authorization|api[-_]?key)([-_]|$)/i.test(normalized)
  );
}

export function redactDeep(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== "object") return value;

  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactDeep(item, seen));
  }

  const output: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    output[key] = isSensitiveKey(key) ? REDACTED : redactDeep(nestedValue, seen);
  }
  return output;
}
