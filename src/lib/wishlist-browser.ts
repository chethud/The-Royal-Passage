import type { WishlistItem } from "@/lib/api/wishlist";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

const WISHLIST_SELECT = `
  experience_id,
  created_at,
  experiences (
    id,
    slug,
    title,
    tagline,
    city,
    hero_image_url,
    price_per_person_minor,
    average_rating,
    review_count,
    currency_code,
    hosts ( display_name )
  )
`;

type WishlistRow = {
  experience_id: string;
  created_at: string;
  experiences: {
    id: string;
    slug: string;
    title: string;
    tagline: string | null;
    city: string;
    hero_image_url: string | null;
    price_per_person_minor: number | null;
    average_rating: number | null;
    review_count: number | null;
    currency_code: string | null;
    hosts: { display_name: string | null } | null;
  } | null;
};

function currencySymbol(code: string | null | undefined): string {
  if (code === "EUR") return "€";
  if (code === "USD") return "$";
  return "₹";
}

function mapWishlistRow(row: WishlistRow): WishlistItem {
  const experience = row.experiences;
  const hostName = experience?.hosts?.display_name ?? "Host";

  return {
    experienceId: row.experience_id,
    savedAt: row.created_at,
    experience: {
      id: experience?.id ?? row.experience_id,
      slug: experience?.slug ?? "",
      title: experience?.title ?? "Experience",
      tagline: experience?.tagline ?? null,
      city: experience?.city ?? "",
      image: experience?.hero_image_url ?? "",
      pricePerPerson: Math.round((experience?.price_per_person_minor ?? 0) / 100),
      rating: Number(experience?.average_rating ?? 0),
      reviewsCount: Number(experience?.review_count ?? 0),
      currencySymbol: currencySymbol(experience?.currency_code),
      hostName,
    },
  };
}

async function requireUserId(): Promise<string> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const userId = data.session?.user?.id;
  if (!userId) throw new Error("Sign in to use your wishlist.");
  return userId;
}

export async function fetchWishlistBrowser(): Promise<WishlistItem[]> {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error("Wishlist is not configured.");
  }

  await requireUserId();
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("wishlist")
    .select(WISHLIST_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as WishlistRow[]).map(mapWishlistRow);
}

export async function fetchWishlistIdsBrowser(): Promise<string[]> {
  if (!isSupabaseBrowserConfigured()) return [];

  try {
    await requireUserId();
  } catch {
    return [];
  }

  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase.from("wishlist").select("experience_id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.experience_id as string);
}

export async function addWishlistItemBrowser(experienceId: string): Promise<void> {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error("Wishlist is not configured.");
  }

  const userId = await requireUserId();
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.from("wishlist").upsert(
    { guest_id: userId, experience_id: experienceId },
    { onConflict: "guest_id,experience_id" },
  );

  if (error) throw new Error(error.message);
}

export async function removeWishlistItemBrowser(experienceId: string): Promise<void> {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error("Wishlist is not configured.");
  }

  await requireUserId();
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.from("wishlist").delete().eq("experience_id", experienceId);
  if (error) throw new Error(error.message);
}
