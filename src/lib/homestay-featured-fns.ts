import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Homestay } from "@/data/homestays";
import { getSupabaseConfigError, isSupabaseReadable } from "@/lib/env.server";
import {
  HOMESTAY_FEATURED_KEY,
  HOMESTAY_FEATURED_SLOT_COUNT,
} from "@/lib/homestay-featured-keys";
import { requireHomepageAdmin, writePlatformSetting } from "@/lib/homepage-photo.server";
import { deleteServerCache } from "@/lib/cache.server";
import { getSupabaseAdmin, getSupabaseServerRead } from "@/lib/supabase/admin";

export function parseFeaturedHomestaySlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0)
    .map((slug) => slug.trim())
    .slice(0, HOMESTAY_FEATURED_SLOT_COUNT);
}

export function resolveFeaturedHomestays(all: Homestay[], slugs: string[]): Homestay[] {
  const catalog = all.filter(Boolean);
  if (catalog.length === 0) return [];

  const bySlug = new Map(catalog.map((stay) => [stay.slug, stay]));
  const resolved: Homestay[] = [];

  for (const slug of slugs) {
    const stay = bySlug.get(slug);
    if (stay && !resolved.some((item) => item.id === stay.id)) {
      resolved.push(stay);
    }
  }

  if (resolved.length < HOMESTAY_FEATURED_SLOT_COUNT) {
    for (const stay of catalog) {
      if (resolved.length >= HOMESTAY_FEATURED_SLOT_COUNT) break;
      if (!resolved.some((item) => item.id === stay.id)) {
        resolved.push(stay);
      }
    }
  }

  return resolved.slice(0, HOMESTAY_FEATURED_SLOT_COUNT);
}

export async function fetchFeaturedHomestaySlugs(): Promise<string[]> {
  if (!isSupabaseReadable()) return [];

  try {
    const supabase = getSupabaseServerRead();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", HOMESTAY_FEATURED_KEY)
      .maybeSingle();

    if (error) {
      console.error("[homestay-featured] Failed to load platform_settings:", error.message);
      return [];
    }

    return parseFeaturedHomestaySlugs(data?.value);
  } catch (err) {
    console.error("[homestay-featured] Failed to load featured slugs:", err);
    return [];
  }
}

function invalidateHomestayCatalogCache() {
  const windowDay = new Date().toISOString().slice(0, 10);
  deleteServerCache(`homestays:catalog:${windowDay}:v1`);
}

export const getFeaturedHomestaySlugs = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => fetchFeaturedHomestaySlugs(),
);

export const saveFeaturedHomestays = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      slugs: z
        .array(z.string().min(1))
        .length(HOMESTAY_FEATURED_SLOT_COUNT)
        .refine((slugs) => new Set(slugs).size === HOMESTAY_FEATURED_SLOT_COUNT, {
          message: "Each featured slot must be a different homestay.",
        }),
    }),
  )
  .handler(async ({ data }): Promise<{ slugs: string[] }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();
    await writePlatformSetting(supabase, HOMESTAY_FEATURED_KEY, data.slugs);
    invalidateHomestayCatalogCache();
    return { slugs: data.slugs };
  });
