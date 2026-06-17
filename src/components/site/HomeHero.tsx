import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { EditablePhotoField } from "@/components/editor/EditableHomepageFields";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import type { HomepageHeroSlide } from "@/lib/homepage-content";
import { withHomepageCacheBust } from "@/lib/homepage-content";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useAuthUser } from "@/lib/auth-user";

const softEase = [0.22, 1, 0.36, 1] as const;

const revealParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const revealItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: softEase } },
};

type HomeHeroProps = {
  slides: HomepageHeroSlide[];
  imageVersion?: number;
  editable?: boolean;
  onSlidesChange?: (slides: HomepageHeroSlide[]) => void;
  uploadPhoto?: (itemIndex: number) => (file: File) => Promise<string>;
};

export function HomeHero({
  slides,
  imageVersion = 0,
  editable = false,
  onSlidesChange,
  uploadPhoto,
}: HomeHeroProps) {
  const reduceMotion = usePrefersReducedMotion();
  const { user } = useAuthUser();
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = slides.map((slide) => ({
    src: withHomepageCacheBust(slide.imageUrl, imageVersion),
    alt: slide.alt,
  }));

  const updateSlide = (index: number, patch: Partial<HomepageHeroSlide>) => {
    if (!onSlidesChange) return;
    onSlidesChange(slides.map((slide, idx) => (idx === index ? { ...slide, ...patch } : slide)));
  };

  return (
    <section className="relative min-h-[max(640px,100dvh)] w-full overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)]">
      <div className="absolute inset-0 z-0">
        <HeroSlideshow
          images={heroSlides}
          reduceMotion={reduceMotion}
          intervalMs={6000}
          activeIndex={activeSlide}
          onActiveIndexChange={setActiveSlide}
          className="absolute inset-0 h-full w-full"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,oklch(0.12_0.06_22_/_0.82)_0%,oklch(0.12_0.06_22_/_0.55)_45%,oklch(0.12_0.06_22_/_0.25)_75%,oklch(0.12_0.06_22_/_0.6)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
          aria-hidden
        />
      </div>

      <div className="container-page relative z-10 flex min-h-[max(640px,100dvh)] flex-col justify-center pt-[var(--header-height)]">
        <div className="py-14 md:py-20">
          <motion.div className="max-w-2xl" variants={revealParent} initial="hidden" animate="show">
            <motion.div variants={revealItem} className="eyebrow mb-5 text-ember/95">
              Curated Experiences
            </motion.div>
            <motion.h1
              variants={revealItem}
              className="font-display text-[clamp(2.4rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-ink text-balance [text-shadow:0_0.06em_0.4em_oklch(0.05_0.04_18_/_0.85)]"
            >
              Experience
              <br />
              <span className="text-ember [text-shadow:0_0_1.1em_oklch(0.55_0.14_78_/_0.45)]">
                Mysuru,
              </span>
              <br />
              Royally
            </motion.h1>
            <motion.p
              variants={revealItem}
              className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-ink/85 text-balance sm:mt-7 sm:text-[1.05rem] md:max-w-lg"
            >
              Step into the cultural heart of Karnataka. From heritage walks to culinary journeys,
              we craft experiences that connect you with the soul of Mysuru.
            </motion.p>
            <motion.div
              variants={revealItem}
              className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4"
            >
              <Link
                to="/experiences"
                className="group inline-flex items-center gap-2 rounded-sm bg-ember px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-8 sm:py-4 sm:text-xs"
              >
                Explore Experiences
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {!user ? (
                <Link
                  to="/sign-in"
                  className="inline-flex items-center rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-transparent px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/85 backdrop-blur-md transition-colors hover:border-ember/55 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-7 sm:py-4 sm:text-xs"
                >
                  Sign in
                </Link>
              ) : null}
            </motion.div>
          </motion.div>
        </div>

        {editable && uploadPhoto ? (
          <div className="pointer-events-auto absolute inset-x-0 bottom-24 z-20 px-4 sm:bottom-28">
            <div className="container-page max-w-md">
              <EditablePhotoField
                label={`Hero slide ${activeSlide + 1} of ${slides.length}`}
                imageUrl={slides[activeSlide]?.imageUrl ?? ""}
                alt={slides[activeSlide]?.alt ?? ""}
                uploadPhoto={uploadPhoto(activeSlide)}
                onImageChange={(imageUrl) => updateSlide(activeSlide, { imageUrl })}
                onAltChange={(alt) => updateSlide(activeSlide, { alt })}
              />
            </div>
          </div>
        ) : null}

        <div className="pointer-events-auto absolute inset-x-0 bottom-8 z-20 flex items-center justify-center gap-2">
          {heroSlides.map((slide, i) => (
            <button
              key={`${slide.src}-${i}`}
              type="button"
              onClick={() => setActiveSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1 transition-all ${
                i === activeSlide ? "w-10 bg-ember" : "w-6 bg-ink/30 hover:bg-ink/55"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
