import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseEventFilters, type EventFiltersSearch } from "./eventFilters";

export function useEventFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseEventFilters(searchParams), [searchParams]);

  function update(patch: Partial<EventFiltersSearch>) {
    const next = { ...filters, ...patch, offset: 0 };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "" || value === null) continue;
      params.set(key, String(value));
    }
    setSearchParams(params);
  }

  function setPage(offset: number) {
    const params = new URLSearchParams(searchParams);
    params.set("offset", String(Math.max(0, offset)));
    setSearchParams(params);
  }

  return { filters, update, setPage };
}
