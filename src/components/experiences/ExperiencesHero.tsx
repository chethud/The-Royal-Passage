import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import heroImage from "@/assets/curated-expeditions.png";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ExperiencesHeroProps = {
  signedIn?: boolean;
};

export function ExperiencesHero({ signedIn }: ExperiencesHeroProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="relative min-h-[42vh] overflow-hidden md:min-h-[48vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Luxury travel experiences across South India"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#4A0000]/95 via-[#4A0000]/82 to-[#5B0000]/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A0000] via-transparent to-[#4A0000]/40" />

      <div className="container-page relative z-10 flex min-h-[42vh] flex-col justify-center pb-16 pt-[calc(var(--header-height)+2rem)] md:min-h-[48vh] md:pb-20 md:pt-[calc(var(--header-height)+2.5rem)]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="eyebrow text-[#D4AF6A]">The Royal Collection</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-[#F7F1E8] sm:text-5xl md:text-6xl lg:text-[4rem]">
            Discover Extraordinary Experiences
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#D6C8B5] sm:text-lg">
            Curated cultural, wellness, culinary and rural journeys crafted for discerning
            travellers across Mysuru and beyond.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#experiences-grid"
              className="luxury-btn-primary"
            >
              Explore Experiences
            </a>
            {signedIn ? (
              <Link to="/dashboard/wishlist" className="luxury-btn-secondary">
                View Wishlist
              </Link>
            ) : (
              <Link to="/sign-in" search={{ redirect: "/experiences" }} className="luxury-btn-secondary">
                Sign in to save
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
