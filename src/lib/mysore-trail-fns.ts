import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_MYSORE_TRAIL,
  MYSORE_TRAIL_SETTING_KEY,
  normalizeMysoreTrail,
  type MysoreTrailItinerary,
} from "@/data/mysore-trail";
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

export const getMysoreTrail = createServerFn({ method: "GET" }).handler(
  async (): Promise<MysoreTrailItinerary> => fetchMysoreTrailFromDb(),
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
