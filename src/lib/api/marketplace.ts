import type { Experience } from "@/data/experiences";
import { apiFetch } from "@/lib/api/client";

export type CatalogPayload = {
  mode: "live" | "static";
  experiences: Experience[];
  categories: string[];
  cities: string[];
  citySlugs?: string[];
};

export type ExperienceDetailPayload = {
  exp: Experience;
  source: "live" | "static";
};

export function fetchCatalog(citySlug?: string) {
  const query = citySlug ? `?city=${encodeURIComponent(citySlug)}` : "";
  return apiFetch<CatalogPayload>(`/api/v1/catalog${query}`);
}

export function fetchExperienceBySlug(slug: string) {
  return apiFetch<ExperienceDetailPayload>(`/api/v1/experiences/${encodeURIComponent(slug)}`);
}

