import { createServerFn } from "@tanstack/react-start";
import { homestays as staticHomestays } from "@/data/homestays";
import { isMysuruHomestay } from "@/lib/homestay-filters";
import { isApiConfigured } from "@/lib/api/client";
import { fetchHomestayBySlug, fetchHomestays } from "@/lib/api/homestays";
import { getOrSetServerCache } from "@/lib/cache.server";
import { isSupabaseConfigured } from "@/lib/env.server";
import { mapProtoHomestay } from "@/lib/homestay-db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Homestay, HomestayDatePrice, HomestayRoom } from "@/data/homestays";

function mapDbRoom(row: Record<string, unknown>): HomestayRoom {
  return {
    id: row.id as string,
    name: row.name as string,
    category: (row.category as string | null) ?? undefined,
    capacity: Number(row.capacity ?? 2),
    pricePerNight: Math.round(Number(row.price_per_night_minor ?? 0) / 100),
    weekendPricePerNight: Math.round(
      Number(row.weekend_price_per_night_minor ?? row.price_per_night_minor ?? 0) / 100,
    ),
    totalUnits: Number(row.total_units ?? 1),
    amenities: (row.amenities as string[] | null) ?? [],
    extraBedAvailable: Boolean(row.extra_bed_available),
    extraBedPricePerNight: Math.round(Number(row.extra_bed_price_per_night_minor ?? 0) / 100),
    extraBedWeekendPricePerNight: Math.round(
      Number(row.weekend_extra_bed_price_per_night_minor ?? row.extra_bed_price_per_night_minor ?? 0) / 100,
    ),
    extraBedsPerRoom: Number(row.extra_beds_per_room ?? 1) >= 2 ? 2 : 1,
  };
}

function fallbackCatalog() {
  const homestays = staticHomestays.filter(isMysuruHomestay);
  return {
    mode: "static" as const,
    homestays,
    propertyTypes: [...new Set(homestays.map((stay) => stay.propertyType))],
    cities: [...new Set(homestays.map((stay) => stay.city))],
  };
}

async function loadHomestaysFromDb(citySlug = "mysuru"): Promise<Homestay[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("homestays")
    .select(
      `
      *,
      homestay_owners ( full_name, approval_status )
    `,
    )
    .eq("status", "published");
  if (citySlug) query = query.eq("city_slug", citySlug);
  const { data: rows, error } = await query;
  if (error) throw new Error(error.message);
  const visible = (rows ?? []).filter((row) => {
    const owner = row.homestay_owners as { approval_status?: string } | null;
    return owner?.approval_status !== "rejected" && owner?.approval_status !== "suspended";
  });
  if (visible.length === 0) return [];

  const ids = visible.map((row) => row.id as string);
  const { data: roomRows, error: roomError } = await supabase
    .from("homestay_rooms")
    .select("*")
    .in("homestay_id", ids)
    .eq("is_active", true)
    .order("sort_order");
  if (roomError) throw new Error(roomError.message);

  const roomsByStay = new Map<string, Record<string, unknown>[]>();
  for (const room of roomRows ?? []) {
    const homestayId = room.homestay_id as string;
    const list = roomsByStay.get(homestayId) ?? [];
    list.push(room as Record<string, unknown>);
    roomsByStay.set(homestayId, list);
  }

  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 365);
  const horizonIso = horizon.toISOString().slice(0, 10);
  const { data: priceRows, error: priceError } = await supabase
    .from("homestay_availability")
    .select("homestay_id, date, price_override_minor, extra_bed_price_override_minor, note")
    .in("homestay_id", ids)
    .eq("is_blocked", false)
    .is("room_id", null)
    .gte("date", today)
    .lte("date", horizonIso)
    .not("price_override_minor", "is", null)
    .order("date");
  if (priceError) throw new Error(priceError.message);

  const datePricesByStay = new Map<string, HomestayDatePrice[]>();
  for (const row of priceRows ?? []) {
    const homestayId = row.homestay_id as string;
    const priceMinor = row.price_override_minor;
    if (priceMinor == null) continue;
    const list = datePricesByStay.get(homestayId) ?? [];
    const extraMinor = row.extra_bed_price_override_minor;
    list.push({
      date: row.date as string,
      pricePerNight: Math.round(Number(priceMinor) / 100),
      label: (row.note as string | null) ?? undefined,
      extraBedPricePerNight:
        extraMinor == null ? undefined : Math.round(Number(extraMinor) / 100),
    });
    datePricesByStay.set(homestayId, list);
  }

  return visible
    .map((row) => {
    const owner = row.homestay_owners as { full_name?: string } | null;
    const galleryUrls = (row.gallery_urls as string[] | null) ?? [];
    const hero = (row.hero_image_url as string | null) ?? "";
    const rooms = roomsByStay.get(row.id as string) ?? [];
    const baseNight = Math.round(Number(row.price_per_night_minor ?? 0) / 100);
    const weekendNight = Math.round(
      Number(row.weekend_price_per_night_minor ?? row.price_per_night_minor ?? 0) / 100,
    );
    return {
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      tagline: (row.tagline as string | null) ?? "",
      description: (row.description as string | null) ?? "",
      propertyType: row.property_type as Homestay["propertyType"],
      city: row.city as string,
      region: (row.region as string | null) ?? undefined,
      address: (row.address as string | null) ?? "",
      mapLink: (row.map_link as string | null) ?? undefined,
      pricePerNight: baseNight,
      weekendPricePerNight: weekendNight,
      currencySymbol: "₹",
      rating: Number(row.rating_avg ?? 0),
      reviewsCount: Number(row.reviews_count ?? 0),
      image: hero,
      galleryUrls: galleryUrls.length ? galleryUrls : hero ? [hero] : [],
      amenities: (row.amenities as Homestay["amenities"]) ?? [],
      houseRules: (row.house_rules as string[] | null) ?? [],
      bedrooms: Number(row.bedrooms ?? 1),
      bathrooms: Number(row.bathrooms ?? 1),
      maxGuests: Number(row.max_guests ?? 2),
      checkInTime: String(row.check_in_time ?? "14:00").slice(0, 5),
      checkOutTime: String(row.check_out_time ?? "11:00").slice(0, 5),
      rooms: rooms.length ? rooms.map(mapDbRoom) : undefined,
      extraBedAvailable: Boolean(row.extra_bed_available),
      extraBedPricePerNight: Math.round(Number(row.extra_bed_price_per_night_minor ?? 0) / 100),
      extraBedWeekendPricePerNight: Math.round(
        Number(row.weekend_extra_bed_price_per_night_minor ?? row.extra_bed_price_per_night_minor ?? 0) / 100,
      ),
      extraBedsPerRoom: Number(row.extra_beds_per_room ?? 1) >= 2 ? 2 : 1,
      datePrices: datePricesByStay.get(row.id as string),
    };
  })
    .filter(isMysuruHomestay);
}

export const getHomestaysForUi = createServerFn({ method: "GET" }).handler(async () => {
  const loadCatalog = async () => {
    if (isApiConfigured()) {
      try {
        return await fetchHomestays();
      } catch {
        /* fall through */
      }
    }
    if (isSupabaseConfigured()) {
      try {
        const homestays = await loadHomestaysFromDb();
        if (homestays.length > 0) {
          return {
            mode: "live" as const,
            homestays,
            propertyTypes: [...new Set(homestays.map((stay) => stay.propertyType))],
            cities: [...new Set(homestays.map((stay) => stay.city))],
          };
        }
      } catch {
        /* fall through */
      }
    }
    return fallbackCatalog();
  };

  try {
    const windowDay = new Date().toISOString().slice(0, 10);
    return await getOrSetServerCache(`homestays:catalog:${windowDay}:v1`, 60, loadCatalog);
  } catch {
    return fallbackCatalog();
  }
});

export const getHomestayForDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    if (isApiConfigured()) {
      try {
        return await fetchHomestayBySlug(data.slug);
      } catch {
        /* fall through */
      }
    }
    if (isSupabaseConfigured()) {
      try {
        const homestays = await loadHomestaysFromDb();
        const homestay = homestays.find((stay) => stay.slug === data.slug);
        if (homestay) return { homestay, source: "live" as const };
      } catch {
        /* fall through */
      }
    }
    const homestay = staticHomestays.find((stay) => stay.slug === data.slug);
    if (!homestay) return null;
    return { homestay, source: "static" as const };
  });
