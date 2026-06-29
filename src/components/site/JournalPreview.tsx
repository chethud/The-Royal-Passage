import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/site/ScrollReveal";
import {
  EditablePhotoField,
  EditableTextField,
} from "@/components/editor/EditableHomepageFields";
import type { HomepageJournalItem } from "@/lib/homepage-content";
import type { HomepagePhotoSection } from "@/lib/homepage-content-keys";
import { withHomepageCacheBust } from "@/lib/homepage-content";

type JournalPreviewProps = {
  items: HomepageJournalItem[];
  imageVersion?: number;
  editable?: boolean;
  onItemsChange?: (items: HomepageJournalItem[]) => void;
  uploadPhoto?: (section: HomepagePhotoSection, itemIndex: number) => (file: File) => Promise<string>;
};

export function JournalPreview({
  items,
  imageVersion = 0,
  editable = false,
  onItemsChange,
  uploadPhoto,
}: JournalPreviewProps) {
  const updateItem = (index: number, patch: Partial<HomepageJournalItem>) => {
    if (!onItemsChange) return;
    onItemsChange(items.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  return (
    <section className="bg-background pt-10 pb-8 sm:pt-12 sm:pb-10 md:pt-14 md:pb-12">
      <div className="container-page">
        <ScrollRevealGroup
          depth3d
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
        >
          <ScrollRevealItem depth3d>
            <div>
              <div className="eyebrow mb-3 text-ember/95">Stories & Inspiration</div>
              <h2 className="font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
                From our Journal
              </h2>
            </div>
          </ScrollRevealItem>
          {!editable ? (
            <ScrollRevealItem depth3d>
              <Link
                to="/journal"
                className="group inline-flex items-center gap-2 self-start rounded-sm text-xs font-semibold uppercase tracking-[0.22em] text-ember transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
              >
                View all stories
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollRevealItem>
          ) : null}
        </ScrollRevealGroup>

        <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-7">
          {items.map((story, idx) => {
            const imageSrc = withHomepageCacheBust(story.imageUrl, imageVersion);
            return editable ? (
              <article
                key={story.id}
                className="overflow-hidden rounded-md border border-ember/40 bg-[oklch(0.98_0.01_86)] shadow-soft"
              >
                <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/5] md:aspect-[5/6]">
                  <img
                    key={imageSrc}
                    src={imageSrc}
                    alt={story.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4">
                    <EditablePhotoField
                      label={`Story ${idx + 1}`}
                      imageUrl={story.imageUrl}
                      alt={story.alt}
                      uploadPhoto={uploadPhoto ? uploadPhoto("journal", idx) : undefined}
                      onImageChange={(imageUrl) => updateItem(idx, { imageUrl })}
                      onAltChange={(alt) => updateItem(idx, { alt })}
                    />
                    <EditableTextField
                      label="Title"
                      value={story.title}
                      onChange={(title) => updateItem(idx, { title })}
                    />
                    <EditableTextField
                      label="Excerpt"
                      value={story.excerpt}
                      onChange={(excerpt) => updateItem(idx, { excerpt })}
                      multiline
                    />
                  </div>
                </div>
              </article>
            ) : (
              <ScrollReveal
                key={story.id}
                as="article"
                depth3d
                delay={idx * 0.08}
                className="group overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-ember/55 hover:shadow-[0_28px_60px_-30px_oklch(0.55_0.14_78_/_0.45)]"
              >
                <Link
                  to="/journal"
                  className="relative block aspect-[5/4] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:aspect-[4/5] md:aspect-[5/6]"
                >
                  <img
                    src={imageSrc}
                    alt={story.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-lg uppercase tracking-[0.16em] text-ember drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                      {story.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                      {story.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink transition-colors group-hover:text-ember">
                      Read more
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
