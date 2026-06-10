import { fetchCities } from "@/lib/api/cities";
import { fetchHostCategories, type CategoryOption } from "@/lib/api/host-experiences";
import { FALLBACK_CITIES, type CitySummary } from "@/lib/cities";
import { FALLBACK_CATEGORIES } from "@/lib/experience-categories";

/** Royal Passage currently operates in Mysuru only. */
export const HOST_CITY_SLUG = "mysuru";

export function hostOperatingCities(cities: CitySummary[]): CitySummary[] {
  const mysuru =
    cities.find((city) => city.slug === HOST_CITY_SLUG) ??
    FALLBACK_CITIES.find((city) => city.slug === HOST_CITY_SLUG);
  return mysuru ? [mysuru] : FALLBACK_CITIES.slice(0, 1);
}

type HostFormReferenceData = {
  categories: CategoryOption[];
  cities: CitySummary[];
};

let cachedReferenceData: HostFormReferenceData | null = null;
let inflightReferenceData: Promise<HostFormReferenceData> | null = null;

export function getCachedHostFormReferenceData(): HostFormReferenceData {
  return (
    cachedReferenceData ?? {
      categories: FALLBACK_CATEGORIES,
      cities: hostOperatingCities(FALLBACK_CITIES),
    }
  );
}

export async function loadHostFormReferenceData(
  accessToken: string,
): Promise<HostFormReferenceData> {
  if (cachedReferenceData) return cachedReferenceData;
  if (inflightReferenceData) return inflightReferenceData;

  inflightReferenceData = Promise.all([
    fetchHostCategories(accessToken).catch(() => [] as CategoryOption[]),
    fetchCities().catch(() => [] as CitySummary[]),
  ])
    .then(([categoryRows, cityRows]) => {
      const data: HostFormReferenceData = {
        categories: categoryRows.length > 0 ? categoryRows : FALLBACK_CATEGORIES,
        cities: hostOperatingCities(cityRows.length > 0 ? cityRows : FALLBACK_CITIES),
      };
      cachedReferenceData = data;
      return data;
    })
    .finally(() => {
      inflightReferenceData = null;
    });

  return inflightReferenceData;
}
