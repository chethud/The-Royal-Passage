import type { CitySummary } from "@/lib/cities";
import { apiFetch } from "@/lib/api/client";

export function fetchCities() {
  return apiFetch<CitySummary[]>("/api/v1/cities");
}

export function fetchCityBySlug(slug: string) {
  return apiFetch<CitySummary>(`/api/v1/cities/${encodeURIComponent(slug)}`);
}
