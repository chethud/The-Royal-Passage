import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type GuestEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: "/experiences" | "/dashboard/cart" | "/dashboard/wishlist";
};

export function GuestEmptyState({
  icon,
  title,
  description,
  ctaLabel = "Explore experiences",
  ctaTo = "/experiences",
}: GuestEmptyStateProps) {
  return (
    <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-8 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center text-ember">{icon}</div>
      <h3 className="mt-4 font-display text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link
        to={ctaTo}
        className="mt-6 inline-flex rounded-sm bg-ember px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-[var(--shadow-gold)]"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
