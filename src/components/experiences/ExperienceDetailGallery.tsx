import type { Experience } from "@/data/experiences";
import { categoryIconForLabel } from "@/lib/experience-category-icons";
import { getExperienceCoverImage } from "@/lib/experience-cover-image";

type ExperienceDetailGalleryProps = {
  exp: Experience;
};

/** Fixed cover image for detail and booking — does not rotate through the gallery. */
export function ExperienceDetailGallery({ exp }: ExperienceDetailGalleryProps) {
  const cover = getExperienceCoverImage(exp);
  const CategoryIcon = categoryIconForLabel(exp.category);

  if (!cover) return null;

  return (
    <div
      className="experience-detail-gallery-main relative w-full overflow-hidden rounded-md border border-[rgb(201_162_39/0.32)] bg-[rgb(0_0_0/0.2)] shadow-[0_24px_56px_-28px_rgb(0_0_0/0.65)]"
      aria-label={`${exp.title} cover photo`}
    >
      <img
        src={cover}
        alt={exp.title}
        className="experience-detail-gallery__image aspect-[4/5] w-full object-cover md:aspect-auto md:h-[min(70vh,640px)]"
        width={1200}
        height={1500}
        decoding="async"
        fetchPriority="high"
      />

      <div className="absolute left-3.5 top-3.5 z-10">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-gold backdrop-blur-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
          aria-label={exp.category}
          title={exp.category}
        >
          <CategoryIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
    </div>
  );
}
