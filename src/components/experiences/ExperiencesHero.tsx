import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import heroImage from "@/assets/curated-expeditions.png";
import { ExperiencesSearchBar } from "@/components/experiences/ExperiencesSearchBar";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ExperiencesHeroProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  showWishlistHeart?: boolean;
  signedIn?: boolean;
};

export function ExperiencesHero({
  searchValue,
  onSearchChange,
  showWishlistHeart = false,
  signedIn = false,
}: ExperiencesHeroProps) {
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

          <div className="mt-6">
            <a href="#experiences-grid" className="luxury-btn-sm luxury-btn-primary">
              Explore Experiences
            </a>
          </div>

          <div className="mt-4 flex max-w-xl items-stretch gap-2">
            <ExperiencesSearchBar
              value={searchValue}
              onChange={onSearchChange}
              className="min-w-0 flex-1"
            />
            {showWishlistHeart ? (
              signedIn ? (
                <Link
                  to="/dashboard/cart"
                  className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center text-[#D4AF6A] transition-colors hover:text-[#F7F1E8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A25A]/25"
                  aria-label="View cart and wishlist"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/sign-in"
                  search={{ redirect: "/experiences" }}
                  className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center text-[#D4AF6A] transition-colors hover:text-[#F7F1E8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A25A]/25"
                  aria-label="Sign in to use cart and wishlist"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Link>
              )
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
