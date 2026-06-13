import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { WishlistItem } from "@/lib/api/wishlist";
import type { CartItem } from "@/lib/cart-storage";

type CartItemsSectionProps = {
  items: CartItem[];
  removingId: string | null;
  onRemove: (experienceId: string) => void;
};

export function CartItemsSection({ items, removingId, onRemove }: CartItemsSectionProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[oklch(0.88_0.08_86_/_0.2)] bg-background/20 px-5 py-8 text-center">
        <ShoppingCart className="mx-auto h-6 w-6 text-muted-foreground/60" />
        <p className="mt-2 font-display text-base text-foreground">Your cart is empty</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tap the cart icon on any experience to save it here before booking.
        </p>
        <Link to="/experiences" className="luxury-btn-sm luxury-btn-primary mt-4 inline-flex">
          Browse experiences
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.experienceId}>
          <CartRow
            item={item}
            removing={removingId === item.experienceId}
            onRemove={() => onRemove(item.experienceId)}
            primaryAction={
              <Link
                to="/dashboard/cart/checkout/$slug"
                params={{ slug: item.slug }}
                search={
                  item.slotId
                    ? { slotId: item.slotId, guests: item.guests ?? 1 }
                    : undefined
                }
                className="luxury-btn-sm luxury-btn-primary"
              >
                Buy
              </Link>
            }
          />
        </li>
      ))}
    </ul>
  );
}

type WishlistCartSectionProps = {
  items: WishlistItem[];
  cartExperienceIds: Set<string>;
  removingId: string | null;
  addingId: string | null;
  onRemove: (experienceId: string) => void;
  onAddToCart: (item: WishlistItem) => void;
};

export function WishlistCartSection({
  items,
  cartExperienceIds,
  removingId,
  addingId,
  onRemove,
  onAddToCart,
}: WishlistCartSectionProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[oklch(0.88_0.08_86_/_0.2)] bg-background/20 px-5 py-8 text-center">
        <Heart className="mx-auto h-6 w-6 text-muted-foreground/60" />
        <p className="mt-2 font-display text-base text-foreground">No saved experiences yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use the heart on any experience to build your wishlist.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const inCart = cartExperienceIds.has(item.experienceId);
        return (
          <li key={item.experienceId}>
            <CartRow
              item={{
                experienceId: item.experienceId,
                slug: item.experience.slug,
                title: item.experience.title,
                tagline: item.experience.tagline ?? undefined,
                city: item.experience.city,
                image: item.experience.image,
                pricePerPerson: item.experience.pricePerPerson,
                currencySymbol: item.experience.currencySymbol,
                addedAt: item.savedAt,
              }}
              removing={removingId === item.experienceId}
              onRemove={() => onRemove(item.experienceId)}
              removeLabel="Remove from wishlist"
              removeIcon={<Heart className="h-3.5 w-3.5 fill-current text-ember" />}
              primaryAction={
                <button
                  type="button"
                  disabled={inCart || addingId === item.experienceId}
                  onClick={() => onAddToCart(item)}
                  className="luxury-btn-sm luxury-btn-secondary disabled:opacity-50"
                >
                  {inCart ? "In cart" : "Add to cart"}
                </button>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}

type CartRowProps = {
  item: CartItem;
  removing: boolean;
  onRemove: () => void;
  primaryAction: ReactNode;
  removeLabel?: string;
  removeIcon?: ReactNode;
};

function CartRow({
  item,
  removing,
  onRemove,
  primaryAction,
  removeLabel = "Remove from cart",
  removeIcon = <Trash2 className="h-3.5 w-3.5" />,
}: CartRowProps) {
  return (
    <article className="glass-strong flex gap-3 overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-3 sm:gap-4 sm:p-4">
      <Link
        to="/experiences/$slug"
        params={{ slug: item.slug }}
        className="relative h-16 w-20 shrink-0 overflow-hidden rounded-sm bg-muted sm:h-[4.5rem] sm:w-24"
      >
        {item.image ? (
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{item.city}</div>
          <Link
            to="/experiences/$slug"
            params={{ slug: item.slug }}
            className="mt-0.5 block truncate font-display text-base leading-snug hover:text-ember sm:text-lg"
          >
            {item.title}
          </Link>
          {item.tagline ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.tagline}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs sm:text-sm">
            From {item.currencySymbol}
            {item.pricePerPerson.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center gap-2">
            {primaryAction}
            <button
              type="button"
              disabled={removing}
              onClick={onRemove}
              className="rounded-full border border-ember/35 bg-background/60 p-1.5 text-foreground transition-colors hover:border-ember/60 disabled:opacity-50"
              aria-label={removeLabel}
            >
              {removeIcon}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
