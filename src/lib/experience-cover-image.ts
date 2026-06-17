import type { Experience } from "@/data/experiences";

type CoverSource = Pick<Experience, "image" | "galleryUrls">;

/** Canonical cover photo — hero image first, then first gallery URL. */
export function getExperienceCoverImage(exp: CoverSource): string {
  const hero = exp.image?.trim();
  if (hero) return hero;
  return exp.galleryUrls?.find((url) => url.trim()) ?? "";
}

export function withExperienceCoverImage<T extends CoverSource>(exp: T): T {
  const image = getExperienceCoverImage(exp);
  return { ...exp, image };
}
