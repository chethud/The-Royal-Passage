import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  EditablePhotoField,
  EditableTextField,
} from "@/components/editor/EditableHomepageFields";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import { SiteBannerStrip } from "@/components/site/SiteBannerStrip";
import { useHomeIntro } from "@/components/site/home-intro";
import {
  takeHeroSlideshow,
  takeNextHeroHeading,
  type HomepageHeroHeading,
  type HomepageHeroSlide,
  type HomepageHeroSlideshow,
  withHomepageCacheBust,
} from "@/lib/homepage-content";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useAuthUser } from "@/lib/auth-user";

const softEase = [0.22, 1, 0.36, 1] as const;

const revealParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};
/** Sweep in from the right; wipe out to the left when idle. */
const revealItem = {
  hidden: { opacity: 0, x: 88 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: softEase },
  },
  exit: {
    opacity: 0,
    x: -72,
    transition: { duration: 0.45, ease: softEase },
  },
};

type HomeHeroProps = {
  slides?: HomepageHeroSlide[];
  /** When set on the public homepage, randomly picks slideshow 2 or 3. */
  slideshows?: HomepageHeroSlideshow[];
  headings?: HomepageHeroHeading[];
  imageVersion?: number;
  editable?: boolean;
  onSlidesChange?: (slides: HomepageHeroSlide[]) => void;
  onHeadingsChange?: (headings: HomepageHeroHeading[]) => void;
  uploadPhoto?: (itemIndex: number) => (file: File) => Promise<string>;
};

export function HomeHero({
  slides,
  slideshows,
  headings = [],
  imageVersion = 0,
  editable = false,
  onSlidesChange,
  onHeadingsChange,
  uploadPhoto,
}: HomeHeroProps) {
  const reduceMotion = usePrefersReducedMotion();
  const intro = useHomeIntro();
  const { user } = useAuthUser();
  const [activeSlide, setActiveSlide] = useState(0);
  const [editHeadingIndex, setEditHeadingIndex] = useState(0);
  const rotatedRef = useRef(false);
  const slideshowPickedRef = useRef(false);
  const [activeHeading, setActiveHeading] = useState<HomepageHeroHeading | null>(
    () => headings[0] ?? null,
  );
  const [displaySlides, setDisplaySlides] = useState<HomepageHeroSlide[]>(
    () => slides ?? slideshows?.[0]?.slides ?? [],
  );

  const cinematic = Boolean(intro) && !editable;
  const chromeRevealed = !cinematic || Boolean(intro?.copyRevealed) || reduceMotion;
  const copyVisible =
    !cinematic || reduceMotion || (Boolean(intro?.copyRevealed) && !intro?.copyWiped);
  const splashDone = !cinematic || Boolean(intro?.splashDone) || reduceMotion;

  useEffect(() => {
    if (editable) {
      setDisplaySlides(slides ?? slideshows?.[0]?.slides ?? []);
      return;
    }
    if (slideshows && slideshows.length >= 3) {
      if (!slideshowPickedRef.current) {
        slideshowPickedRef.current = true;
        setDisplaySlides(takeHeroSlideshow(slideshows, { rotate: true }).slides);
        return;
      }
      setDisplaySlides((prev) => {
        const match = slideshows.find(
          (pack) => pack.slides.length === prev.length && pack.slides[0]?.id === prev[0]?.id,
        );
        return match?.slides ?? prev;
      });
      return;
    }
    setDisplaySlides(slides ?? []);
  }, [editable, slides, slideshows]);

  useEffect(() => {
    if (editable) {
      setActiveHeading(headings[editHeadingIndex] ?? headings[0] ?? null);
      return;
    }
    if (!rotatedRef.current) {
      rotatedRef.current = true;
      setActiveHeading(takeNextHeroHeading(headings, { rotate: true }));
      return;
    }
    setActiveHeading((prev) => {
      if (!prev) return headings[0] ?? null;
      return headings.find((item) => item.id === prev.id) ?? headings[0] ?? null;
    });
  }, [editable, editHeadingIndex, headings]);

  const heroSlides = displaySlides.map((slide) => ({
    src: withHomepageCacheBust(slide.imageUrl, imageVersion),
    alt: slide.alt,
  }));

  const updateSlide = (index: number, patch: Partial<HomepageHeroSlide>) => {
    if (!onSlidesChange) return;
    const base = slides ?? displaySlides;
    onSlidesChange(base.map((slide, idx) => (idx === index ? { ...slide, ...patch } : slide)));
  };

  const updateHeading = (index: number, patch: Partial<HomepageHeroHeading>) => {
    if (!onHeadingsChange) return;
    onHeadingsChange(headings.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const heading = activeHeading ?? headings[0];

  return (
    <section className="relative min-h-[max(640px,100dvh)] w-full overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)]">
      <motion.div
        className="absolute inset-0 z-0 origin-center"
        initial={false}
        animate={
          cinematic && !reduceMotion && splashDone
            ? chromeRevealed
              ? { scale: 1.04 }
              : { scale: 1.08 }
            : { scale: 1 }
        }
        transition={{ duration: 1.4, ease: softEase }}
      >
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
      </motion.div>

      <div className="container-page relative z-10 flex min-h-[max(640px,100dvh)] flex-col justify-center pt-[var(--header-height)]">
        {chromeRevealed ? (
          <div className="pointer-events-none absolute inset-x-0 top-[var(--header-height)] z-20 w-full">
            <motion.div
              className="pointer-events-auto"
              initial={cinematic && !reduceMotion ? { opacity: 0, y: -12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: softEase, delay: 0.08 }}
            >
              <SiteBannerStrip />
            </motion.div>
          </div>
        ) : null}

        <div className="py-14 md:py-20">
          <AnimatePresence mode="wait">
            {copyVisible && heading ? (
              <motion.div
                key={heading.id}
                className="max-w-2xl text-left"
                variants={reduceMotion ? undefined : revealParent}
                initial={reduceMotion || !cinematic ? false : "hidden"}
                animate="show"
                exit={reduceMotion || !cinematic ? undefined : "exit"}
              >
                <motion.div
                  variants={reduceMotion ? undefined : revealItem}
                  className="eyebrow mb-5 text-ember/95"
                >
                  {heading.eyebrow}
                </motion.div>
                <motion.h1
                  variants={reduceMotion ? undefined : revealItem}
                  className="font-display text-[clamp(2.4rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-ink text-balance [text-shadow:0_0.06em_0.4em_oklch(0.05_0.04_18_/_0.85)]"
                >
                  {heading.line1}
                  <br />
                  <span className="text-ember [text-shadow:0_0_1.1em_oklch(0.55_0.14_78_/_0.45)]">
                    {heading.line2}
                  </span>
                  <br />
                  {heading.line3}
                </motion.h1>
                <motion.p
                  variants={reduceMotion ? undefined : revealItem}
                  className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-ink/85 text-balance sm:mt-7 sm:text-[1.05rem] md:max-w-lg"
                >
                  {heading.body}
                </motion.p>
                <motion.div
                  variants={reduceMotion ? undefined : revealItem}
                  className="mt-7 flex flex-wrap items-center justify-start gap-3 sm:mt-9 sm:gap-4"
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
            ) : null}
          </AnimatePresence>
        </div>

        {editable && onHeadingsChange ? (
          <div className="pointer-events-auto absolute inset-x-0 top-[calc(var(--header-height)+1rem)] z-30 px-4">
            <div className="container-page max-w-xl space-y-3 rounded-sm border border-ember/35 bg-black/55 p-3 backdrop-blur-md">
              <div className="flex flex-wrap gap-2">
                {headings.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEditHeadingIndex(index)}
                    className={`rounded-sm border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      editHeadingIndex === index
                        ? "border-ember bg-ember/20 text-ember"
                        : "border-ember/30 text-ink/70 hover:border-ember/55 hover:text-ember"
                    }`}
                  >
                    {index === 0 ? "Priority" : `Heading ${index + 1}`}
                  </button>
                ))}
              </div>
              {headings[editHeadingIndex] ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <EditableTextField
                    label="Eyebrow"
                    value={headings[editHeadingIndex]!.eyebrow}
                    onChange={(eyebrow) => updateHeading(editHeadingIndex, { eyebrow })}
                  />
                  <EditableTextField
                    label="Line 1"
                    value={headings[editHeadingIndex]!.line1}
                    onChange={(line1) => updateHeading(editHeadingIndex, { line1 })}
                  />
                  <EditableTextField
                    label="Accent line"
                    value={headings[editHeadingIndex]!.line2}
                    onChange={(line2) => updateHeading(editHeadingIndex, { line2 })}
                  />
                  <EditableTextField
                    label="Line 3"
                    value={headings[editHeadingIndex]!.line3}
                    onChange={(line3) => updateHeading(editHeadingIndex, { line3 })}
                  />
                  <div className="sm:col-span-2">
                    <EditableTextField
                      label="Body"
                      value={headings[editHeadingIndex]!.body}
                      onChange={(body) => updateHeading(editHeadingIndex, { body })}
                      multiline
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {editable && uploadPhoto ? (
          <div className="pointer-events-auto absolute inset-x-0 bottom-24 z-20 px-4 sm:bottom-28">
            <div className="container-page max-w-md">
              <EditablePhotoField
                label={`Hero slide ${activeSlide + 1} of ${displaySlides.length}`}
                imageUrl={displaySlides[activeSlide]?.imageUrl ?? ""}
                alt={displaySlides[activeSlide]?.alt ?? ""}
                uploadPhoto={uploadPhoto(activeSlide)}
                onImageChange={(imageUrl) => updateSlide(activeSlide, { imageUrl })}
                onAltChange={(alt) => updateSlide(activeSlide, { alt })}
              />
            </div>
          </div>
        ) : null}

        {!editable && chromeRevealed ? (
          reduceMotion ? (
            <a
              href="#experiences"
              aria-label="Scroll to experiences"
              className="pointer-events-auto absolute inset-x-0 bottom-[4.75rem] z-20 flex justify-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.88_0.08_86_/_0.35)] bg-[oklch(0.12_0.06_22_/_0.45)] text-ink/80 backdrop-blur-md">
                <ChevronDown className="h-5 w-5" strokeWidth={1.5} />
              </span>
            </a>
          ) : (
            <motion.a
              href="#experiences"
              aria-label="Scroll to experiences"
              className="pointer-events-auto absolute inset-x-0 bottom-[4.75rem] z-20 flex justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12, ease: softEase }}
            >
              <motion.span
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.88_0.08_86_/_0.35)] bg-[oklch(0.12_0.06_22_/_0.45)] text-ink/80 backdrop-blur-md"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <ChevronDown className="h-5 w-5" strokeWidth={1.5} />
              </motion.span>
            </motion.a>
          )
        ) : null}

        {chromeRevealed ? (
          <motion.div
            className="pointer-events-auto absolute inset-x-0 bottom-8 z-20 flex items-center justify-center gap-2"
            initial={cinematic && !reduceMotion ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1, ease: softEase }}
          >
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
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
