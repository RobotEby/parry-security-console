import { z } from "zod";
import { severitySchema } from "@/lib/api/schemas";

const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());
const optionalSeverity = z.preprocess(emptyToUndefined, severitySchema.optional());

export const eventFiltersSchema = z.object({
  severity: optionalSeverity,
  type: optionalString,
  detector: optionalString,
  action: optionalString,
  path: optionalString,
  ip: optionalString,
  q: optionalString,
  limit: z
    .preprocess(emptyToUndefined, z.coerce.number().int().positive().max(200).catch(25))
    .default(25),
  offset: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).catch(0)).default(0),
});

export type EventFiltersSearch = z.infer<typeof eventFiltersSchema>;

export function parseEventFilters(
  input: URLSearchParams | Record<string, unknown>,
): EventFiltersSearch {
  const raw = input instanceof URLSearchParams ? Object.fromEntries(input.entries()) : input;
  return eventFiltersSchema.parse(raw);
}
