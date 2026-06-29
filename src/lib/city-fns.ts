import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchCities, fetchCityBySlug } from "@/lib/api/cities";
import { isApiConfigured } from "@/lib/api/client";
import { FALLBACK_CITIES, type CitySummary } from "@/lib/cities";
import { isSupabaseConfigured } from "@/lib/env.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type { CitySummary };

async function loadCitiesFromDb(): Promise<CitySummary[]> {
  const supabase = getSupabaseAdmin();
  const columns = "slug, name, region, state, tagline, description";

  const mapRows = (data: unknown) =>
    ((data as Array<Record<string, unknown>>) ?? []).map((row) => ({
      slug: String(row.slug),
      name: String(row.name),
      region: (row.region as string | null) ?? null,
      state: (row.state as string | null) ?? "Karnataka",
      tagline: (row.tagline as string | null) ?? null,
      description: (row.description as string | null) ?? null,
    }));

  try {
    const { data, error } = await supabase
      .from("cities")
      .select(columns)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return mapRows(data);
  } catch {
    const { data, error } = await supabase.from("cities").select(columns).order("slug");
    if (error) throw new Error(error.message);
    return mapRows(data);
  }
}

export const listCities = createServerFn({ method: "GET" }).handler(async (): Promise<CitySummary[]> => {
  if (isApiConfigured()) {
    try {
      return await fetchCities();
    } catch {
      // fall through
    }
  }
  if (isSupabaseConfigured()) {
    try {
      return await loadCitiesFromDb();
    } catch {
      // fall through
    }
  }
  return FALLBACK_CITIES;
});

/** Client-safe loader: API → DB → static fallback; never throws. */
export async function loadCitiesWithFallback(): Promise<CitySummary[]> {
  try {
    const cities = await listCities();
    return cities.length > 0 ? cities : FALLBACK_CITIES;
  } catch {
    return FALLBACK_CITIES;
  }
}

export const getCityBySlug = createServerFn({ method: "POST" })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<CitySummary | null> => {
    const slug = data.slug.trim().toLowerCase();
    if (isApiConfigured()) {
      try {
        return await fetchCityBySlug(slug);
      } catch {
        // fall through
      }
    }
    if (isSupabaseConfigured()) {
      try {
        const rows = await loadCitiesFromDb();
        return rows.find((row) => row.slug === slug) ?? null;
      } catch {
        // fall through
      }
    }
    return FALLBACK_CITIES.find((row) => row.slug === slug) ?? null;
  });
