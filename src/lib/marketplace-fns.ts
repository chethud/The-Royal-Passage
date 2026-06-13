import { createServerFn } from "@tanstack/react-start";
import { isApiConfigured } from "@/lib/api/client";
import { fetchCatalog, fetchExperienceBySlug } from "@/lib/api/marketplace";
import type { Experience } from "@/data/experiences";
import {
  getExperience as getStaticExperience,
  experiences as staticExperiences,
  categories as staticCategories,
  cities as staticCities,
} from "@/data/experiences";
import { isSupabaseConfigured } from "@/lib/env.server";
import { getOrSetServerCache } from "@/lib/cache.server";
import { withGuestBookableSlots } from "@/lib/booking-window";
import { buildCatalogMeta, filterBookableExperiences } from "@/lib/experience-filters";
import { mapRowToExperience, type ExperienceRow, type SlotRow } from "@/lib/experience-db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function fallbackCatalog() {
  const experiences = filterBookableExperiences(staticExperiences);
  const meta = buildCatalogMeta(experiences);
  return {
    mode: "static" as const,
    experiences,
    categories: meta.categories.length > 0 ? meta.categories : [...staticCategories],
    cities: meta.cities.length > 0 ? meta.cities : [...staticCities],
  };
}

function toBookableCatalog(mode: "live" | "static", experiences: Experience[]) {
  const bookable = filterBookableExperiences(experiences);
  return { mode, experiences: bookable, ...buildCatalogMeta(bookable) };
}

function hostVisibleInCatalog(host: ExperienceRow["hosts"]): boolean {
  const status = host?.approval_status;
  return status !== "rejected" && status !== "suspended";
}

async function loadExperienceFromDbBySlug(slug: string): Promise<Experience | null> {
  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("experiences")
    .select(
      `
      *,
      hosts ( display_name, bio, verified, approval_status ),
      experience_categories ( label )
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) return null;
  const exp = row as ExperienceRow;
  if (!hostVisibleInCatalog(exp.hosts)) return null;

  const { data: slotRows, error: e2 } = await supabase
    .from("experience_slots")
    .select("*")
    .eq("experience_id", exp.id)
    .order("slot_date", { ascending: true });
  if (e2) throw new Error(e2.message);

  return withGuestBookableSlots(mapRowToExperience(exp, (slotRows ?? []) as SlotRow[]));
}

async function loadPublishedWithSlots(): Promise<Experience[]> {
  const supabase = getSupabaseAdmin();
  const { data: exps, error: e1 } = await supabase
    .from("experiences")
    .select(
      `
      *,
      hosts ( display_name, bio, verified, approval_status ),
      experience_categories ( label )
    `,
    )
    .eq("status", "published");

  if (e1) throw new Error(e1.message);
  const rows = (exps ?? []) as ExperienceRow[];
  const visible = rows.filter((r) => hostVisibleInCatalog(r.hosts));
  if (visible.length === 0) return [];

  const ids = visible.map((r) => r.id);
  const { data: slotRows, error: e2 } = await supabase
    .from("experience_slots")
    .select("*")
    .in("experience_id", ids)
    .order("slot_date", { ascending: true });

  if (e2) throw new Error(e2.message);
  const slots = (slotRows ?? []) as SlotRow[];
  const byExp = new Map<string, SlotRow[]>();
  for (const s of slots) {
    const list = byExp.get(s.experience_id) ?? [];
    list.push(s);
    byExp.set(s.experience_id, list);
  }

  return visible.map((e) => withGuestBookableSlots(mapRowToExperience(e, byExp.get(e.id) ?? [])));
}

/** Listing + filters: FastAPI when configured; else Supabase; otherwise static demo data. */
export const getCatalogForUi = createServerFn({ method: "GET" }).handler(async () => {
  if (isApiConfigured()) {
    try {
      const catalog = await fetchCatalog();
      return toBookableCatalog(catalog.mode, catalog.experiences);
    } catch {
      return fallbackCatalog();
    }
  }

  if (!isSupabaseConfigured()) {
    return fallbackCatalog();
  }
  try {
    const list = await getOrSetServerCache("catalog:published:v1", 60, loadPublishedWithSlots);
    return toBookableCatalog("live", list);
  } catch {
    // Network / DNS errors should not white-screen the app.
    return fallbackCatalog();
  }
});

/** Detail page: DB listing when present; falls back to static demo by slug. */
export const getExperienceForDetail = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => {
    if (typeof input.slug !== "string" || !input.slug.trim()) {
      throw new Error("slug is required");
    }
    return { slug: input.slug.trim() };
  })
  .handler(async ({ data }): Promise<{ exp: Experience; source: "live" | "static" } | null> => {
    if (isApiConfigured()) {
      try {
        return await fetchExperienceBySlug(data.slug);
      } catch {
        // Fall through to Supabase/static fallback.
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const fromDb = await getOrSetServerCache(
          `experience:${data.slug}:v1`,
          60,
          async () => await loadExperienceFromDbBySlug(data.slug),
        );
        if (fromDb) return { exp: fromDb, source: "live" };
      } catch {
        // Fallback to static listing when DB is temporarily unreachable.
      }
    }
    const stat = getStaticExperience(data.slug);
    if (stat) return { exp: stat, source: "static" };
    return null;
  });

/**
 * Returns every row from main tables — useful in SQL Editor / admin debugging.
 * Still requires service role (server only).
 */
export const getDatabaseSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    hosts: JsonObject[];
    experience_categories: JsonObject[];
    experiences: JsonObject[];
    experience_slots: JsonObject[];
    bookings: JsonObject[];
    reviews: JsonObject[];
    platform_settings: JsonObject[];
  }> => {
    if (!isSupabaseConfigured()) {
      return {
        hosts: [],
        experience_categories: [],
        experiences: [],
        experience_slots: [],
        bookings: [],
        reviews: [],
        platform_settings: [],
      };
    }
    const supabase = getSupabaseAdmin();
    const [
      hosts,
      experience_categories,
      experiences,
      experience_slots,
      bookings,
      reviews,
      platform_settings,
    ] = await Promise.all([
      supabase.from("hosts").select("*").order("created_at"),
      supabase.from("experience_categories").select("*").order("sort_order"),
      supabase.from("experiences").select("*").order("created_at"),
      supabase.from("experience_slots").select("*").order("slot_date"),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_settings").select("*").order("key"),
    ]);

    const err =
      hosts.error ||
      experience_categories.error ||
      experiences.error ||
      experience_slots.error ||
      bookings.error ||
      reviews.error ||
      platform_settings.error;
    if (err) throw new Error(err.message);

    return {
      hosts: (hosts.data ?? []) as JsonObject[],
      experience_categories: (experience_categories.data ?? []) as JsonObject[],
      experiences: (experiences.data ?? []) as JsonObject[],
      experience_slots: (experience_slots.data ?? []) as JsonObject[],
      bookings: (bookings.data ?? []) as JsonObject[],
      reviews: (reviews.data ?? []) as JsonObject[],
      platform_settings: (platform_settings.data ?? []) as JsonObject[],
    };
  },
);
