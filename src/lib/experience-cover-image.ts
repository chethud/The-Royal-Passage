import type { Experience } from "@/data/experiences";

type CoverSource = Pick<Experience, "image" | "galleryUrls">;

/** Canonical cover photo — hero image first, then first gallery URL. */
export function getExperienceCoverImage(exp: CoverSource): string {
  return getExperienceGalleryImages(exp)[0] ?? "";
}

/** All unique gallery images — hero first, then additional gallery URLs. */
export function getExperienceGalleryImages(exp: CoverSource): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const raw of [exp.image, ...(exp.galleryUrls ?? [])]) {
    const url = raw?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

export function withExperienceCoverImage<T extends CoverSource>(exp: T): T {
  const image = getExperienceCoverImage(exp);
  return { ...exp, image };
}
