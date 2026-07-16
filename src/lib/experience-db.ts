import { getExperienceCoverImage } from "@/lib/experience-cover-image";

type HostEmbed = {
  display_name: string;
  bio: string | null;
  verified: boolean;
  approval_status: string;
};

type CategoryEmbed = {
  label: string;
};

export type ExperienceRow = {
  id: string;
  host_id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  category_slug: string;
  city: string;
  city_slug: string | null;
  region: string | null;
  address: string | null;
  map_link: string | null;
  duration_minutes: number;
  price_per_person_minor: number;
  compare_at_price_per_person_minor?: number | null;
  hero_image_url: string | null;
  inclusions: string[];
  exclusions: string[];
  requirements?: string[];
  gallery_urls?: string[];
  cancellation_policy: string | null;
  average_rating: string | number;
  review_count: number;
  currency_code: string;
  status: string;
  min_guests_per_booking?: number;
  max_guests_per_booking?: number;
  hosts: HostEmbed | null;
  experience_categories: CategoryEmbed | null;
};

export type SlotRow = {
  id: string;
  experience_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  seats_sold: number;
  is_blocked: boolean;
};

function formatTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function currencySymbol(code: string): string {
  if (code === "INR") return "₹";
  if (code === "EUR") return "€";
  if (code === "USD") return "$";
  return "₹";
}

export function mapRowToExperience(exp: ExperienceRow, slots: SlotRow[]): Experience {
  const host = exp.hosts;
  const categoryLabel = exp.experience_categories?.label ?? exp.category_slug;
  const sortedSlots = [...slots].sort(
    (a, b) =>
      a.slot_date.localeCompare(b.slot_date) ||
      formatTime(a.start_time).localeCompare(formatTime(b.start_time)),
  );

  const uiSlots: Slot[] = sortedSlots.map((s) => ({
    id: s.id,
    date: s.slot_date,
    start: formatTime(s.start_time),
    end: formatTime(s.end_time),
    capacity: s.capacity,
    available: s.is_blocked ? 0 : Math.max(0, s.capacity - s.seats_sold),
  }));

  const rupees = Math.round(exp.price_per_person_minor / 100);
  const compareAtRupees = exp.compare_at_price_per_person_minor
    ? Math.round(exp.compare_at_price_per_person_minor / 100)
    : null;
  const galleryUrls = exp.gallery_urls?.length
    ? exp.gallery_urls
    : exp.hero_image_url
      ? [exp.hero_image_url]
      : [];
  const image = getExperienceCoverImage({
    image: exp.hero_image_url ?? "",
    galleryUrls,
  });

  return {
    id: exp.id,
    slug: exp.slug,
    title: exp.title,
    tagline: exp.tagline ?? "",
    description: exp.description ?? "",
    category: categoryLabel,
    city: exp.city,
    citySlug: exp.city_slug ?? undefined,
    address: exp.address ?? "",
    mapLink: exp.map_link ?? undefined,
    durationHours: exp.duration_minutes / 60,
    hostName: host?.display_name ?? "Host",
    hostBio: host?.bio ?? "",
    verifiedHost: Boolean(host?.verified),
    pricePerPerson: rupees,
    compareAtPricePerPerson:
      compareAtRupees != null && compareAtRupees > rupees ? compareAtRupees : null,
    rating: Number(exp.average_rating),
    reviewsCount: exp.review_count,
    image,
    inclusions: exp.inclusions ?? [],
    exclusions: exp.exclusions ?? [],
    requirements: exp.requirements ?? [],
    galleryUrls,
    region: exp.region ?? undefined,
    cancellation: exp.cancellation_policy ?? "",
    slots: uiSlots,
    currencySymbol: currencySymbol(exp.currency_code),
    minGuestsPerBooking: exp.min_guests_per_booking ?? 1,
    maxGuestsPerBooking: exp.max_guests_per_booking ?? 10,
  };
}
