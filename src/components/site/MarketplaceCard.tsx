import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export const marketplaceCardActionClass =
  "scale-90 rounded-[var(--radius-md)] border border-[color:rgba(198,161,91,0.3)] bg-[color:rgba(36,16,23,0.52)] p-2 text-[color:var(--royal-ivory)] shadow-none backdrop-blur-sm hover:border-[color:var(--soft-champagne)] hover:bg-[color:rgba(36,16,23,0.68)]";

export const marketplaceCardFrameClass =
  "relative aspect-[16/11] w-full overflow-hidden rounded-[var(--radius-lg)] sm:aspect-[4/5]";

/** Larger frames for the experiences catalog (fits 3 across) — shorter than full-portrait. */
export const marketplaceCardFrameLargeClass =
  "relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] sm:aspect-[4/5] sm:min-h-[16rem] lg:min-h-[18rem] xl:min-h-[20rem]";

export const marketplaceCardShellClass = `${marketplaceCardFrameClass} border border-[color:rgba(198,161,91,0.18)] bg-[color:var(--royal-plum)] shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]`;

export const marketplaceCardShellLargeClass = `${marketplaceCardFrameLargeClass} border border-[color:rgba(198,161,91,0.18)] bg-[color:var(--royal-plum)] shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]`;

type MarketplaceCardLinkProps = {
  to: string;
  params: Record<string, string>;
  search?: Record<string, unknown>;
  ariaLabel?: string;
};

type MarketplaceCardProps = {
  link: MarketplaceCardLinkProps;
  image: string;
  imageAlt: string;
  title: string;
  ctaLabel: string;
  topLeft: ReactNode;
  meta: ReactNode;
  topRight?: ReactNode;
  footer?: ReactNode;
  /** Larger width/height frame — used on the experiences catalog. */
  size?: "default" | "large";
};

function MarketplaceCardContent({
  link,
  image,
  imageAlt,
  title,
  ctaLabel,
  topLeft,
  meta,
  topRight,
  footer,
  size = "default",
}: MarketplaceCardProps) {
  const large = size === "large";
  return (
    <article className={`group ${large ? marketplaceCardShellLargeClass : marketplaceCardShellClass}`}>
      <Link
        to={link.to}
        params={link.params}
        search={link.search ?? {}}
        aria-label={link.ariaLabel}
        className="absolute inset-0 z-10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--antique-gold)] focus-visible:ring-inset"
      >
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(36,16,23,0.96)] via-[rgba(58,8,15,0.42)] to-[rgba(58,8,15,0.08)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />

        <div className="absolute left-2.5 top-2.5 z-20 sm:left-3.5 sm:top-3.5">{topLeft}</div>

        <div
          className={`absolute inset-x-0 bottom-0 z-20 ${
            large ? "px-4 pb-4 pt-8 sm:px-6 sm:pb-5 sm:pt-10" : "px-3.5 pb-3.5 pt-6 sm:px-5 sm:pb-5 sm:pt-8"
          }`}
        >
          <h3
            className={`line-clamp-2 font-display leading-[1.02] tracking-[0.03em] text-[color:var(--royal-ivory)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] transition-colors group-hover:text-[color:var(--soft-champagne)] ${
              large
                ? "text-lg sm:text-xl lg:text-2xl"
                : "text-base sm:text-lg"
            }`}
          >
            {title}
          </h3>
          <div
            className={`mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[color:rgba(245,239,227,0.88)] sm:mt-1.5 sm:gap-x-3 ${
              large ? "text-[0.68rem] sm:text-[0.75rem]" : "text-[0.62rem] sm:text-[0.68rem]"
            }`}
          >
            {meta}
          </div>
          {footer ? <div className="mt-1.5 sm:mt-2">{footer}</div> : null}
          <span
            className={`mt-1.5 inline-flex items-center gap-1.5 font-sans font-semibold uppercase tracking-[0.14em] text-[color:var(--antique-gold)] transition-all duration-300 group-hover:gap-2.5 group-hover:text-[color:var(--soft-champagne)] sm:mt-2 ${
              large ? "text-[0.62rem] sm:text-[0.68rem]" : "text-[0.58rem] sm:text-[0.62rem]"
            }`}
          >
            {ctaLabel}
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      {topRight ? (
        <div className="absolute right-2.5 top-2.5 z-30 flex items-center gap-1">{topRight}</div>
      ) : null}
    </article>
  );
}

export function MarketplaceCard(props: MarketplaceCardProps) {
  const reduceMotion = usePrefersReducedMotion();
  const card = <MarketplaceCardContent {...props} />;

  if (reduceMotion) {
    return <div className="h-full w-full">{card}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full w-full"
    >
      {card}
    </motion.div>
  );
}
