import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_MYSORE_TRAIL,
  MYSORE_TRAIL_SETTING_KEY,
  normalizeMysoreTrail,
  type MysoreTrailItinerary,
} from "@/data/mysore-trail";
import {
  defaultMysoreTrailCatalog,
  MYSORE_TRAIL_CATALOG_KEY,
  normalizeMysoreTrailCatalog,
  type MysoreTrailCatalog,
} from "@/data/mysore-trail-cms";
import { getSupabaseConfigError, isSupabaseReadable } from "@/lib/env.server";
import {
  requireHomepageJournalEditor,
  writePlatformSetting,
} from "@/lib/homepage-photo-upload.server";
import { getSupabaseAdmin, getSupabaseServerRead } from "@/lib/supabase/admin";

const trailStopSchema = z.object({
  id: z.string().min(1).max(64),
  time: z.string().min(1).max(16),
  title: z.string().max(120),
  note: z.string().max(500),
});

const trailDaySchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(60),
  theme: z.string().max(80),
  stops: z.array(trailStopSchema).min(1).max(20),
});

const itinerarySchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(400),
  days: z.array(trailDaySchema).min(1).max(14),
});

const placeDraftSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  shortName: z.string().min(1).max(80),
  tagline: z.string().max(200),
  cityLabel: z.string().max(80),
  image: z.string().min(1).max(2000),
  imageAlt: z.string().max(200),
  description: z.string().max(1200),
  categories: z
    .array(
      z.enum([
        "heritage",
        "architecture",
        "food",
        "culture",
        "nature",
        "photography",
        "shopping",
        "spiritual",
        "hidden",
        "family",
        "luxury",
      ]),
    )
    .min(1)
    .max(6),
});

const heroDraftSchema = z.object({
  id: z.string().min(1).max(64),
  placeId: z.string().max(64).optional(),
  name: z.string().min(1).max(120),
  titleLines: z.array(z.string().min(1).max(40)).min(1).max(3),
  cardLines: z.array(z.string().min(1).max(40)).min(1).max(2),
  location: z.string().max(120),
  eyebrow: z.string().max(80),
  description: z.string().max(500),
  image: z.string().min(1).max(2000),
  imageAlt: z.string().max(200),
  category: z.string().max(60),
});

const catalogSchema = z.object({
  places: z.array(placeDraftSchema).min(1).max(40),
  heroes: z.array(heroDraftSchema).min(1).max(20),
});

export async function fetchMysoreTrailFromDb(): Promise<MysoreTrailItinerary> {
  if (!isSupabaseReadable()) {
    return structuredClone(DEFAULT_MYSORE_TRAIL);
  }

  const supabase = getSupabaseServerRead();
  if (!supabase) {
    return structuredClone(DEFAULT_MYSORE_TRAIL);
  }

  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", MYSORE_TRAIL_SETTING_KEY)
    .maybeSingle();

  if (error) {
    console.error("[mysore-trail] Failed to load:", error.message);
    return structuredClone(DEFAULT_MYSORE_TRAIL);
  }

  return normalizeMysoreTrail(data?.value ?? null);
}

export async function fetchMysoreTrailCatalogFromDb(): Promise<MysoreTrailCatalog> {
  if (!isSupabaseReadable()) {
    return defaultMysoreTrailCatalog();
  }

  const supabase = getSupabaseServerRead();
  if (!supabase) {
    return defaultMysoreTrailCatalog();
  }

  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", MYSORE_TRAIL_CATALOG_KEY)
    .maybeSingle();

  if (error) {
    console.error("[mysore-trail] Failed to load catalog:", error.message);
    return defaultMysoreTrailCatalog();
  }

  return normalizeMysoreTrailCatalog(data?.value ?? null);
}

export const getMysoreTrail = createServerFn({ method: "GET" }).handler(
  async (): Promise<MysoreTrailItinerary> => fetchMysoreTrailFromDb(),
);

export const getMysoreTrailCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<MysoreTrailCatalog> => fetchMysoreTrailCatalogFromDb(),
);

export const saveMysoreTrail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      itinerary: itinerarySchema,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageJournalEditor(data.accessToken);
    const supabase = getSupabaseAdmin();
    const itinerary = normalizeMysoreTrail(data.itinerary);
    await writePlatformSetting(supabase, MYSORE_TRAIL_SETTING_KEY, itinerary);
    return { ok: true };
  });

export const saveMysoreTrailCatalog = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      catalog: catalogSchema,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; catalog: MysoreTrailCatalog }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageJournalEditor(data.accessToken);
    const supabase = getSupabaseAdmin();
    const catalog = normalizeMysoreTrailCatalog(data.catalog);
    await writePlatformSetting(supabase, MYSORE_TRAIL_CATALOG_KEY, catalog);
    return { ok: true, catalog };
  });
