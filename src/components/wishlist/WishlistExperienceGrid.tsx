import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { WishlistItem } from "@/lib/api/wishlist";

type WishlistExperienceGridProps = {
  items: WishlistItem[];
  onRemove: (experienceId: string) => void;
  removingId: string | null;
};

export function WishlistExperienceGrid({ items, onRemove, removingId }: WishlistExperienceGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.experienceId}
          className="glass-strong overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.15)]"
        >
          <div className="relative aspect-[16/10] bg-muted">
            {item.experience.image ? (
              <img src={item.experience.image} alt="" className="h-full w-full object-cover" />
            ) : null}
            <button
              type="button"
              disabled={removingId === item.experienceId}
              onClick={() => onRemove(item.experienceId)}
              className="absolute top-3 right-3 rounded-full border border-ember/40 bg-background/80 p-2 text-ember backdrop-blur-sm disabled:opacity-50"
              aria-label="Remove from wishlist"
            >
              <Heart className="h-4 w-4 fill-current" />
            </button>
          </div>
          <div className="p-5">
            <div className="text-xs text-muted-foreground">{item.experience.city}</div>
            <Link
              to="/experiences/$slug"
              params={{ slug: item.experience.slug }}
              className="mt-1 block font-display text-xl hover:text-ember"
            >
              {item.experience.title}
            </Link>
            {item.experience.tagline ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {item.experience.tagline}
              </p>
            ) : null}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>
                From {item.experience.currencySymbol}
                {item.experience.pricePerPerson.toLocaleString("en-IN")}
              </span>
              <span className="text-ember">★ {item.experience.rating}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
