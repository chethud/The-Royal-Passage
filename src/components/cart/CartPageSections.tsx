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
      <div className="rounded-md border border-dashed border-[oklch(0.88_0.08_86_/_0.2)] bg-background/20 px-6 py-10 text-center">
        <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 font-display text-lg text-foreground">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the cart icon on any experience to save it here before booking.
        </p>
        <Link to="/experiences" className="luxury-btn-sm luxury-btn-primary mt-5 inline-flex">
          Browse experiences
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((item) => (
        <CartRow
          key={item.experienceId}
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
      ))}
    </div>
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
      <div className="rounded-md border border-dashed border-[oklch(0.88_0.08_86_/_0.2)] bg-background/20 px-6 py-10 text-center">
        <Heart className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 font-display text-lg text-foreground">No saved experiences yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the heart on any experience to build your wishlist.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((item) => {
        const inCart = cartExperienceIds.has(item.experienceId);
        return (
          <CartRow
            key={item.experienceId}
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
            removeIcon={<Heart className="h-4 w-4 fill-current text-ember" />}
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
        );
      })}
    </div>
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
  removeIcon = <Trash2 className="h-4 w-4" />,
}: CartRowProps) {
  return (
    <article className="glass-strong overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.15)]">
      <div className="relative aspect-[16/10] bg-muted">
        {item.image ? (
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : null}
        <button
          type="button"
          disabled={removing}
          onClick={onRemove}
          className="absolute top-3 right-3 rounded-full border border-ember/40 bg-background/80 p-2 text-foreground backdrop-blur-sm disabled:opacity-50"
          aria-label={removeLabel}
        >
          {removeIcon}
        </button>
      </div>
      <div className="p-5">
        <div className="text-xs text-muted-foreground">{item.city}</div>
        <Link
          to="/experiences/$slug"
          params={{ slug: item.slug }}
          className="mt-1 block font-display text-xl hover:text-ember"
        >
          {item.title}
        </Link>
        {item.tagline ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.tagline}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm">
            From {item.currencySymbol}
            {item.pricePerPerson.toLocaleString("en-IN")}
          </span>
          {primaryAction}
        </div>
      </div>
    </article>
  );
}
