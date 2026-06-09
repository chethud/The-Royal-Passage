import { fetchCities } from "@/lib/api/cities";
import { fetchHostCategories, type CategoryOption } from "@/lib/api/host-experiences";
import { FALLBACK_CITIES, type CitySummary } from "@/lib/cities";
import { FALLBACK_CATEGORIES } from "@/lib/experience-categories";

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
      cities: FALLBACK_CITIES,
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
        cities: cityRows.length > 0 ? cityRows : FALLBACK_CITIES,
      };
      cachedReferenceData = data;
      return data;
    })
    .finally(() => {
      inflightReferenceData = null;
    });

  return inflightReferenceData;
}
