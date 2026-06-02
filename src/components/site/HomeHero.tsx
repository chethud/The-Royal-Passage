import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { lazy, Suspense, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import heroPalaceImg from "@/assets/hero-image.png";
import heroDinnerImg from "@/assets/hero.jpg";
import expDiningImg from "@/assets/exp-dining.jpg";
import expCraftImg from "@/assets/exp-craft.jpg";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import { ClocheIcon, CrownIcon, LotusBudIcon, LotusIcon } from "@/components/site/PillarIcons";

const RippleGrid = lazy(() => import("@/components/effects/RippleGrid"));

const softEase = [0.22, 1, 0.36, 1] as const;

const revealParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const revealItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: softEase } },
};

const sidePillars = [
  { icon: LotusBudIcon, label: "Authentic & Local" },
  { icon: CrownIcon, label: "Royal Heritage" },
  { icon: LotusIcon, label: "Sustainable Tourism" },
  { icon: ClocheIcon, label: "Bespoke Service" },
];

const heroSlides = [
  { src: heroPalaceImg, alt: "Mysuru Palace at golden hour through arched colonnade" },
  { src: heroDinnerImg, alt: "A candlelit private dinner under a glasshouse at dusk" },
  { src: expDiningImg, alt: "A plated culinary course in dramatic light" },
  { src: expCraftImg, alt: "Hands shaping clay on a pottery wheel" },
];

export function HomeHero() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="relative min-h-[max(640px,100dvh)] w-full overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)]">
      {/* SLIDESHOW BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <HeroSlideshow
          images={heroSlides}
          reduceMotion={reduceMotion}
          intervalMs={6000}
          className="absolute inset-0 h-full w-full"
        />
        {/* darken & vignette so type stays readable */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,oklch(0.12_0.06_22_/_0.82)_0%,oklch(0.12_0.06_22_/_0.55)_45%,oklch(0.12_0.06_22_/_0.25)_75%,oklch(0.12_0.06_22_/_0.6)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
          aria-hidden
        />
      </div>

      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-50">
          <Suspense fallback={null}>
            <RippleGrid
              enableRainbow={false}
              gridColor="#d4af37"
              rippleIntensity={0.04}
              gridSize={8.5}
              gridThickness={11}
              fadeDistance={1.4}
              vignetteStrength={2.4}
              glowIntensity={0.1}
              opacity={0.28}
              gridRotation={6}
              mouseInteraction
              mouseInteractionRadius={1.1}
            />
          </Suspense>
        </div>
      )}

      {/* CONTENT */}
      <div className="container-page relative z-10 flex min-h-[max(640px,100dvh)] flex-col justify-center pt-[var(--header-height)]">
        <div className="grid items-center gap-10 py-14 md:grid-cols-[1fr_auto] md:gap-12 md:py-20 lg:gap-16">
          <motion.div className="max-w-2xl" variants={revealParent} initial="hidden" animate="show">
            <motion.div variants={revealItem} className="eyebrow mb-5 text-ember/95">
              Curated Experiences · Timeless Memories
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
              <button
                type="button"
                className="group inline-flex items-center gap-3 rounded-sm border border-[oklch(0.88_0.08_86_/_0.45)] bg-background/15 px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink backdrop-blur-md transition-colors hover:border-ember/70 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-7 sm:py-4 sm:text-xs"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ember/60 bg-ember/15">
                  <Play className="h-3 w-3 fill-ember text-ember" />
                </span>
                Watch Film
              </button>
            </motion.div>
          </motion.div>

          {/* SIDE PILLARS */}
          <motion.aside
            aria-label="Our standards"
            className="hidden md:block"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.9, ease: softEase }}
          >
            <ul className="flex flex-col items-center gap-5 border-l border-[oklch(0.88_0.08_86_/_0.18)] py-2 pl-5 lg:gap-7 lg:pl-7">
              {sidePillars.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="group flex flex-col items-center gap-2 text-center text-[0.58rem] uppercase tracking-[0.2em] text-ink/75 transition-colors hover:text-ember lg:text-[0.62rem] lg:tracking-[0.22em]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/20 text-ember/90 backdrop-blur-md transition-all group-hover:border-ember/70 group-hover:bg-ember/10 lg:h-12 lg:w-12">
                    <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
                  </span>
                  <span className="max-w-[5rem] leading-tight">{label}</span>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>

        {/* SLIDE DOTS */}
        <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-2">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.src}
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
