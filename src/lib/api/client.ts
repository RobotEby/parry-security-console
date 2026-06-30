import type { ZodTypeAny, z } from "zod";
import { getRuntimeConfig, type ApiConfig } from "@/lib/config/runtime-config";
import { apiErrorSchema } from "./schemas";
import type { ApiError } from "./types";

export class ParryApiError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ParryApiError";
    this.code = error.code;
    this.status = error.status;
  }
}

export class ParryUnauthorizedError extends ParryApiError {
  constructor(message = "Unauthorized") {
    super({ message, code: "PARRY_ADMIN_UNAUTHORIZED", status: 401 });
    this.name = "ParryUnauthorizedError";
  }
}

export class ParryNetworkError extends ParryApiError {
  constructor(message: string, status?: number, code?: string) {
    super({ message, status, code });
    this.name = "ParryNetworkError";
  }
}

export class ParryValidationError extends ParryApiError {
  constructor(message: string) {
    super({ message, code: "PARRY_RESPONSE_VALIDATION_ERROR" });
    this.name = "ParryValidationError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

type FetchOptions = {
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
};

function buildUrl(base: string, path: string, query?: Record<string, QueryValue>) {
  const trimmed = base.replace(/\/$/, "");
  const target = `${trimmed}${path}`;
  const url = /^https?:\/\//i.test(target)
    ? new URL(target)
    : new URL(target.startsWith("/") ? target : `/${target}`, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const json = await res.clone().json();
    const parsed = apiErrorSchema.safeParse(json);
    if (parsed.success) {
      return {
        message: parsed.data.error,
        code: parsed.data.code,
        status: res.status,
      };
    }
  } catch {
    // Intentionally ignore parse errors; responses may be plain text/empty.
  }
  return { message: `Admin API returned ${res.status}`, status: res.status };
}

export async function parryFetchWithConfig<S extends ZodTypeAny>(
  config: ApiConfig,
  path: string,
  schema: S,
  opts: FetchOptions = {},
): Promise<z.infer<S>> {
  const apiUrl = config.apiUrl.trim();
  if (!apiUrl) {
    throw new ParryNetworkError("No Admin API URL configured");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = config.adminToken?.trim();
  if (token) headers["x-parry-admin-token"] = token;

  let res: Response;
  try {
    res = await fetch(buildUrl(apiUrl, path, opts.query), {
      method: "GET",
      headers,
      signal: opts.signal,
    });
  } catch (error) {
    throw new ParryNetworkError(error instanceof Error ? error.message : "Network error");
  }

  if (res.status === 401 || res.status === 403) {
    throw new ParryUnauthorizedError();
  }

  if (!res.ok) {
    const apiError = await parseErrorResponse(res);
    throw new ParryNetworkError(apiError.message, apiError.status, apiError.code);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ParryValidationError("Response was not valid JSON");
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ParryValidationError(
      `Response did not match expected schema: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}

export async function parryFetch<S extends ZodTypeAny>(
  path: string,
  schema: S,
  opts: FetchOptions = {},
): Promise<z.infer<S>> {
  return parryFetchWithConfig(getRuntimeConfig(), path, schema, opts);
}

export const __private__ = { buildUrl };
