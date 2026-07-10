import { createServerFn } from "@tanstack/react-start";
import { isSupabaseReadable } from "@/lib/env.server";
import { HOMESTAY_FEATURED_KEY } from "@/lib/homestay-featured-keys";
import { parseFeaturedHomestaySlugs } from "@/lib/homestay-featured";
import { deleteServerCache } from "@/lib/cache.server";
import { getSupabaseServerRead } from "@/lib/supabase/admin";

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

export function invalidateHomestayCatalogCache() {
  const windowDay = new Date().toISOString().slice(0, 10);
  deleteServerCache(`homestays:catalog:${windowDay}:v1`);
}

export const getFeaturedHomestaySlugs = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => fetchFeaturedHomestaySlugs(),
);
