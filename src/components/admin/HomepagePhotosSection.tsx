import { AdminHomepagePhotoEditor } from "@/components/admin/AdminHomepagePhotoEditor";
import { AdminHomestayFeaturedEditor } from "@/components/admin/AdminHomestayFeaturedEditor";
import type { HomepageContent } from "@/lib/homepage-content";
import type { ShowcaseExperienceOption } from "@/lib/showcase-from-experience";

type HomestayOption = {
  slug: string;
  title: string;
  city: string;
  image?: string;
};

type HomepagePhotosSectionProps = {
  homepage: HomepageContent;
  experiences: ShowcaseExperienceOption[];
  homestays: HomestayOption[];
  featuredSlugs: string[];
  onFeaturedSaved: (slugs: string[]) => void;
};

export function HomepagePhotosSection({
  homepage,
  experiences,
  homestays,
  featuredSlugs,
  onFeaturedSaved,
}: HomepagePhotosSectionProps) {
  return (
    <div className="space-y-10 pt-2">
      <AdminHomepagePhotoEditor initialContent={homepage} experiences={experiences} />

      <section className="space-y-4 border-t border-[rgb(200_162_90/0.22)] pt-8">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-ink">Featured homestays</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Pick the three stays shown in &ldquo;Rest Where Stories Live&rdquo; on the public
            homestays page.
          </p>
        </div>
        <AdminHomestayFeaturedEditor
          homestays={homestays}
          initialSlugs={featuredSlugs}
          onSaved={onFeaturedSaved}
        />
      </section>
    </div>
  );
}
