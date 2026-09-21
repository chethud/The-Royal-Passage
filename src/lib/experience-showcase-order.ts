import type { Experience } from "@/data/experiences";
import type { HomepageShowcaseItem } from "@/lib/homepage-content-keys";

export const EXPERIENCE_SHOWCASE_SLOT_COUNT = 3;

/** Extract experience slug from a showcase href like `/experiences/my-slug`. */
export function experienceSlugFromShowcaseHref(href: string): string | null {
  const match = href.trim().match(/^\/experiences\/([^/?#]+)/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** Ordered slugs from homepage “Top 3 Experiences” showcase slots. */
export function showcaseExperienceSlugs(items: HomepageShowcaseItem[]): string[] {
  const slugs: string[] = [];
  for (const item of items) {
    const slug = experienceSlugFromShowcaseHref(item.href);
    if (slug && !slugs.includes(slug)) {
      slugs.push(slug);
    }
    if (slugs.length >= EXPERIENCE_SHOWCASE_SLOT_COUNT) break;
  }
  return slugs;
}

/** Homepage top experiences first (same order), then the remaining catalog. */
export function orderExperiencesWithShowcaseFirst(
  experiences: Experience[] | null | undefined,
  showcaseSlugs: string[] | null | undefined,
): Experience[] {
  const list = experiences ?? [];
  const slugs = showcaseSlugs ?? [];
  if (list.length === 0 || slugs.length === 0) return list;

  const bySlug = new Map(list.map((exp) => [exp.slug, exp]));
  const featured: Experience[] = [];
  const featuredIds = new Set<string>();

  for (const slug of slugs) {
    const exp = bySlug.get(slug);
    if (exp && !featuredIds.has(exp.id)) {
      featured.push(exp);
      featuredIds.add(exp.id);
    }
  }

  const rest = list.filter((exp) => !featuredIds.has(exp.id));
  return [...featured, ...rest];
}
