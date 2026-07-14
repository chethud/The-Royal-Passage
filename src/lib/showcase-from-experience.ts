import type { Experience } from "@/data/experiences";
import type { HomepageShowcaseItem, ShowcaseIconKey } from "@/lib/homepage-content-keys";
import { getExperienceCoverImage } from "@/lib/experience-cover-image";

export type ShowcaseExperienceOption = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  image: string;
  hostName: string;
  category: string;
};

export function toShowcaseExperienceOption(exp: Experience): ShowcaseExperienceOption {
  return {
    id: exp.id,
    slug: exp.slug,
    title: exp.title,
    tagline: exp.tagline,
    image: getExperienceCoverImage(exp),
    hostName: exp.hostName,
    category: exp.category,
  };
}

export function showcaseIconKeyForCategory(category: string): ShowcaseIconKey {
  const value = category.toLowerCase();
  if (value.includes("craft") || value.includes("potter")) return "pottery";
  if (
    value.includes("tast") ||
    value.includes("dining") ||
    value.includes("cook") ||
    value.includes("culinary") ||
    value.includes("flame")
  ) {
    return "flame";
  }
  return "heritage";
}

/** Fill a top-experience slot from a published host listing. */
export function showcaseItemFromExperience(
  option: ShowcaseExperienceOption,
  fallback: HomepageShowcaseItem,
): HomepageShowcaseItem {
  const imageUrl = option.image.trim() || fallback.imageUrl;
  return {
    id: fallback.id,
    iconKey: showcaseIconKeyForCategory(option.category),
    title: option.title.trim() || fallback.title,
    imageUrl,
    alt: (option.tagline || option.title).trim() || fallback.alt,
    href: `/experiences/${option.slug}`,
  };
}
