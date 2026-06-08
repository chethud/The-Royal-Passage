import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import { fetchCatalog, fetchExperienceBySlug, createBooking as apiCreateBooking } from "@/lib/api/marketplace";
import type { Experience } from "@/data/experiences";
import {
  getExperience as getStaticExperience,
  experiences as staticExperiences,
  categories as staticCategories,
  cities as staticCities,
} from "@/data/experiences";
import { isSupabaseConfigured } from "@/lib/env.server";
import { getOrSetServerCache } from "@/lib/cache.server";
import { mapRowToExperience, type ExperienceRow, type SlotRow } from "@/lib/experience-db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function fallbackCatalog() {
  return {
    mode: "static" as const,
    experiences: staticExperiences,
    categories: [...staticCategories],
    cities: [...staticCities],
  };
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
  if (exp.hosts?.approval_status !== "approved") return null;

  const { data: slotRows, error: e2 } = await supabase
    .from("experience_slots")
    .select("*")
    .eq("experience_id", exp.id)
    .order("slot_date", { ascending: true });
  if (e2) throw new Error(e2.message);

  return mapRowToExperience(exp, (slotRows ?? []) as SlotRow[]);
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
  const approved = rows.filter((r) => r.hosts?.approval_status === "approved");
  if (approved.length === 0) return [];

  const ids = approved.map((r) => r.id);
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

  return approved.map((e) => mapRowToExperience(e, byExp.get(e.id) ?? []));
}

/** Listing + filters: FastAPI when configured; else Supabase; otherwise static demo data. */
export const getCatalogForUi = createServerFn({ method: "GET" }).handler(async () => {
  if (isApiConfigured()) {
    try {
      return await fetchCatalog();
    } catch {
      return fallbackCatalog();
    }
  }

  if (!isSupabaseConfigured()) {
    return fallbackCatalog();
  }
  try {
    const list = await getOrSetServerCache("catalog:published:v1", 60, loadPublishedWithSlots);
    return {
      mode: "live" as const,
      experiences: list,
      categories: [...new Set(list.map((e) => e.category))].sort(),
      cities: [...new Set(list.map((e) => e.city))].sort(),
    };
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

const bookingInput = z.object({
  slotId: z.string().uuid(),
  guestCount: z.number().int().min(1).max(50),
  guestName: z.string().min(1).max(200),
  guestEmail: z.string().email(),
  guestPhone: z.string().max(30).optional(),
});

/**
 * Creates a pending booking after a server-side capacity check.
 * Does not increment seats_sold (confirm that in a payment webhook + transaction in production).
 */
export const createPendingBooking = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => bookingInput.parse(raw))
  .handler(
    async ({ data }): Promise<{ bookingId: string; subtotalMinor: number; status: string }> => {
      if (isApiConfigured()) {
        return apiCreateBooking(data);
      }

      if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured on the server.");
      }
      const supabase = getSupabaseAdmin();
      type SlotJoin = SlotRow & {
        experiences: {
          id: string;
          price_per_person_minor: number;
          currency_code: string;
        } | null;
      };

      const { data: slot, error: sErr } = await supabase
        .from("experience_slots")
        .select("*, experiences ( id, price_per_person_minor, currency_code )")
        .eq("id", data.slotId)
        .maybeSingle();

      if (sErr) throw new Error(sErr.message);
      if (!slot) throw new Error("Slot not found.");
      const slotRow = slot as SlotJoin;
      if (slotRow.is_blocked) throw new Error("This slot is not available.");

      const available = Math.max(0, slotRow.capacity - slotRow.seats_sold);
      if (data.guestCount > available) {
        throw new Error("Not enough seats left for this slot.");
      }

      const exp = slotRow.experiences;
      if (!exp) throw new Error("Experience not found for this slot.");

      const { data: feeRow } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "commission_percent")
        .maybeSingle();
      const rawFee = feeRow?.value;
      const commissionPercent =
        typeof rawFee === "number"
          ? rawFee
          : typeof rawFee === "string"
            ? Number.parseFloat(rawFee)
            : Number(rawFee ?? 12.5);

      const subtotalMinor = exp.price_per_person_minor * data.guestCount;
      const platformFeeMinor = Math.round((subtotalMinor * commissionPercent) / 100);
      const hostPayoutMinor = subtotalMinor - platformFeeMinor;

      const holdMins = 15;
      const holdExpires = new Date(Date.now() + holdMins * 60 * 1000).toISOString();

      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .insert({
          slot_id: data.slotId,
          guest_email: data.guestEmail,
          guest_name: data.guestName,
          guest_phone: data.guestPhone ?? null,
          guest_count: data.guestCount,
          status: "pending_payment",
          subtotal_minor: subtotalMinor,
          platform_fee_minor: platformFeeMinor,
          host_payout_minor: hostPayoutMinor,
          currency_code: exp.currency_code,
          hold_expires_at: holdExpires,
        })
        .select("id")
        .single();

      if (bErr) throw new Error(bErr.message);
      if (!booking) throw new Error("Failed to create booking.");

      return {
        bookingId: booking.id,
        subtotalMinor,
        status: "pending_payment",
      };
    },
  );

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
