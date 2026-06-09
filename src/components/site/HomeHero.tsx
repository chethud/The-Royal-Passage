import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import heroPalaceImg from "@/assets/hero-image.png";
import heroDinnerImg from "@/assets/hero.jpg";
import expDiningImg from "@/assets/exp-dining.jpg";
import expCraftImg from "@/assets/exp-craft.jpg";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";

const softEase = [0.22, 1, 0.36, 1] as const;

const revealParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const revealItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: softEase } },
};

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
          activeIndex={activeSlide}
          onActiveIndexChange={setActiveSlide}
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

      {/* CONTENT */}
      <div className="container-page relative z-10 flex min-h-[max(640px,100dvh)] flex-col justify-center pt-[var(--header-height)]">
        <div className="py-14 md:py-20">
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
              <Link
                to="/sign-in"
                className="inline-flex items-center rounded-sm border border-[oklch(0.88_0.08_86_/_0.45)] bg-background/15 px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink backdrop-blur-md transition-colors hover:border-ember/70 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-7 sm:py-4 sm:text-xs"
              >
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* SLIDE DOTS */}
        <div className="pointer-events-auto absolute inset-x-0 bottom-8 z-20 flex items-center justify-center gap-2">
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
