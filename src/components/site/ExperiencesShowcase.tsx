import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Landmark,
  Palette,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import expCraftImg from "@/assets/exp-craft.jpg";
import heroPalaceImg from "@/assets/hero-image.png";
import outdoorCookingImg from "@/assets/outdoor-cooking.png";

type ShowcaseCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  alt: string;
  href: string;
};

const cards: ShowcaseCard[] = [
  {
    icon: Palette,
    title: "Pottery Experience",
    description: "Get your hands muddy and share tradition with local artisans.",
    image: expCraftImg,
    alt: "Hands shaping clay on a pottery wheel",
    href: "/experiences?category=Craft",
  },
  {
    icon: Flame,
    title: "Outdoor Cooking",
    description: "Cook in nature, fire in the wild. Memories that linger.",
    image: outdoorCookingImg,
    alt: "Open fire cooking in the wild under warm light",
    href: "/experiences?category=Tasting",
  },
  {
    icon: Landmark,
    title: "Heritage Walks",
    description: "Walk through stories carved in stone.",
    image: heroPalaceImg,
    alt: "Mysuru palace at golden hour",
    href: "/experiences",
  },
];

export function ExperiencesShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 8);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.85;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <section className="relative border-y border-[oklch(0.88_0.08_86_/_0.1)] bg-[oklch(0.16_0.07_22)] py-16 sm:py-20 md:py-24">
      <div className="container-page">
        <div className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="eyebrow mb-3 text-ember/95">Our Experiences</div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7 }}
              className="font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl md:text-[2.65rem]"
            >
              Curated. Immersive. Unforgettable.
            </motion.h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground text-balance sm:text-[0.95rem]">
              Handpicked experiences that showcase the art, culture, nature, and heritage of Mysuru
              in the most authentic way.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 md:absolute md:right-0 md:top-1/2 md:mt-0 md:-translate-y-1/2">
            <button
              type="button"
              aria-label="Previous experiences"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.88_0.08_86_/_0.32)] text-ink transition-all hover:border-ember/70 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next experiences"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ember/60 bg-ember/10 text-ember transition-all hover:bg-ember/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((c) => (
            <ExperienceShowcaseCard key={c.title} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceShowcaseCard({ card }: { card: ShowcaseCard }) {
  const Icon = card.icon;
  return (
    <motion.article
      data-card
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.65 }}
      className="group relative w-[15rem] shrink-0 snap-start overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.16)] shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-ember/55 hover:shadow-[0_28px_60px_-30px_oklch(0.55_0.14_78_/_0.45)] sm:w-[16rem] md:w-48 md:min-w-48"
    >
      <Link
        to={card.href as "/experiences"}
        className="relative block aspect-[3/5] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <img
          src={card.image}
          alt={card.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        {/* Bottom-anchored gradient — opaque at the base, fades to transparent before mid-height */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 from-0% via-black/55 via-35% to-transparent to-65%"
        />
        {/* Subtle vignette on the top corners so the icon reads against bright skies */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
        />
        <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-ember/45 bg-background/55 text-ember backdrop-blur-md">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-4">
          <div className="font-display text-[0.9rem] uppercase leading-tight tracking-[0.16em] text-ember drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] md:text-[0.85rem]">
            {card.title}
          </div>
          <p className="mt-2 line-clamp-3 text-[0.76rem] leading-relaxed text-ink/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)] md:text-[0.72rem]">
            {card.description}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ink transition-colors group-hover:text-ember">
            Explore
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
