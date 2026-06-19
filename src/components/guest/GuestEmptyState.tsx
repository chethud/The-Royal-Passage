import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type GuestEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: "/experiences" | "/dashboard/cart" | "/dashboard/wishlist";
  surface?: "light" | "dark";
};

export function GuestEmptyState({
  icon,
  title,
  description,
  ctaLabel = "Explore experiences",
  ctaTo = "/experiences",
  surface = "dark",
}: GuestEmptyStateProps) {
  const isLight = surface === "light";

  if (isLight) {
    return (
      <article className="py-14 text-center" role="status">
        <div className="mx-auto flex h-8 w-8 items-center justify-center text-[#C8A25A]/75">{icon}</div>
        <h3 className="luxury-panel-heading mt-3 font-display text-xl tracking-wide">{title}</h3>
        <p className="luxury-panel-body mt-2 text-xs leading-relaxed">{description}</p>
        <Link
          to={ctaTo}
          className="luxury-btn-sm luxury-btn-primary mt-6 inline-flex items-center gap-2"
        >
          {ctaLabel}
        </Link>
      </article>
    );
  }

  return (
    <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 text-center" role="status">
      <div className="mx-auto flex h-8 w-8 items-center justify-center text-ember">{icon}</div>
      <h3 className="mt-3 font-display text-xl">{title}</h3>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      <Link
        to={ctaTo}
        className="mt-6 inline-flex rounded-sm bg-ember px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-[var(--shadow-gold)]"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
