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
    <section className="relative min-h-[28vh] overflow-hidden md:min-h-[32vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Luxury travel experiences across South India"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#4A0000]/92 via-[#4A0000]/78 to-[#5B0000]/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A0000] via-transparent to-[#4A0000]/30" />

      <div className="container-page relative z-10 flex min-h-[28vh] flex-col justify-center pb-10 pt-[calc(var(--header-height)+1.25rem)] md:min-h-[32vh] md:pb-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="eyebrow text-[#D4AF6A]">The Royal Collection</p>
          <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight text-[#F7F1E8] sm:text-4xl md:text-[2.75rem]">
            Discover Extraordinary Experiences
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D6C8B5] md:text-base">
            Curated cultural, wellness, culinary and rural journeys across Mysuru and beyond.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#experiences-grid" className="luxury-btn-sm luxury-btn-primary">
              Explore Experiences
            </a>
            {signedIn ? (
              <Link to="/dashboard/wishlist" className="luxury-btn-sm luxury-btn-secondary">
                View Wishlist
              </Link>
            ) : (
              <Link
                to="/sign-in"
                search={{ redirect: "/experiences" }}
                className="luxury-btn-sm luxury-btn-secondary"
              >
                Sign in to save
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
