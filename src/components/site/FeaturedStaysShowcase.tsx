import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Landmark, Mountain, Trees, type LucideIcon } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/site/ScrollReveal";
import { HOMESTAY_FEATURED_SLOT_COUNT } from "@/lib/homestay-featured-keys";
import type { Homestay } from "@/data/homestays";

type FeaturedStaysShowcaseProps = {
  stays: Homestay[];
};

function stayShowcaseIcon(stay: Homestay): LucideIcon {
  const haystack = `${stay.title} ${stay.slug} ${stay.tagline}`.toLowerCase();

  if (/haveli|heritage|palace|fort|courtyard/.test(haystack)) return Landmark;
  if (/hill|mountain|foothill/.test(haystack)) return Mountain;
  if (/villa|garden|resort/.test(haystack) || stay.propertyType === "Resort") return Trees;
  if (/guest|hotel|boutique|room/.test(haystack) || stay.propertyType === "Hotel") return Building2;
  if (stay.propertyType === "Home Stay") return Landmark;

  switch (stay.propertyType) {
    case "Home Stay":
      return Landmark;
    case "Resort":
      return Trees;
    case "Hotel":
      return Building2;
    default:
      return Building2;
  }
}

export function FeaturedStaysShowcase({ stays }: FeaturedStaysShowcaseProps) {
  const topStays = stays.slice(0, HOMESTAY_FEATURED_SLOT_COUNT);
  if (topStays.length === 0) return null;

  return (
    <section
      id="homestays"
      className="relative border-y border-[oklch(0.88_0.08_86_/_0.1)] bg-[oklch(0.14_0.06_22)] pt-16 pb-8 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12"
    >
      <div className="container-page">
        <ScrollRevealGroup
          depth3d
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
        >
          <ScrollRevealItem depth3d>
            <h2 className="font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
              Our Top 3 Stays
            </h2>
          </ScrollRevealItem>
          <ScrollRevealItem depth3d>
            <Link
              to="/homestays"
              className="group inline-flex items-center gap-2 self-start rounded-sm text-xs font-semibold uppercase tracking-[0.22em] text-ember transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
            >
              View all stays
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </ScrollRevealItem>
        </ScrollRevealGroup>

        <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-7">
          {topStays.map((stay, index) => {
            const StayIcon = stayShowcaseIcon(stay);

            return (
            <ScrollReveal
              key={stay.id}
              as="article"
              depth3d
              delay={index * 0.08}
              className="group overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-ember/55 hover:shadow-[0_28px_60px_-30px_oklch(0.55_0.14_78_/_0.45)]"
            >
              <Link
                to="/homestays/$slug"
                params={{ slug: stay.slug }}
                aria-label={`View ${stay.title}`}
                className="relative block aspect-[5/4] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:aspect-[4/5] md:aspect-[5/6]"
              >
                <img
                  src={stay.image}
                  alt={stay.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
                />
                <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[oklch(0.78_0.1_78_/_0.55)] bg-[oklch(0.14_0.05_22_/_0.72)] text-ember shadow-[inset_0_1px_0_oklch(0.9_0.06_82_/_0.2),0_0_18px_oklch(0.7_0.12_78_/_0.25)] backdrop-blur-md">
                  <StayIcon className="h-5 w-5" aria-hidden />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink/80">
                    {stay.propertyType}
                  </p>
                  <h3 className="font-display text-lg uppercase tracking-[0.16em] text-ember drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                    {stay.title}
                  </h3>
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
