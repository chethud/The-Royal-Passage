import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShoppingCart, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { WishlistItem } from "@/lib/api/wishlist";
import type { CartItem } from "@/lib/cart-storage";

type Surface = "light" | "dark";

type CartItemsSectionProps = {
  items: CartItem[];
  removingId: string | null;
  onRemove: (experienceId: string) => void;
  surface?: Surface;
};

export function CartItemsSection({
  items,
  removingId,
  onRemove,
  surface = "dark",
}: CartItemsSectionProps) {
  const isLight = surface === "light";

  if (items.length === 0) {
    return (
      <div className="py-14 text-center">
        <ShoppingCart
          className={`mx-auto h-7 w-7 ${isLight ? "text-[#C8A25A]/70" : "text-[#D4AF6A]/45"}`}
          strokeWidth={1.5}
        />
        <p className={`mt-4 font-display text-lg tracking-wide ${isLight ? "luxury-panel-heading" : "text-foreground"}`}>
          Your cart is empty
        </p>
        <p className={`mt-2 text-xs leading-relaxed ${isLight ? "luxury-panel-body" : "text-muted-foreground/90"}`}>
          Tap the cart icon on any experience to save it here before booking.
        </p>
        <Link
          to="/experiences"
          className="luxury-btn-sm luxury-btn-primary mt-6 inline-flex items-center gap-2"
        >
          Browse experiences
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <ul className={isLight ? "divide-y divide-[#C8A25A]/22" : "divide-y divide-[#C8A25A]/12"}>
      {items.map((item) => (
        <li key={item.experienceId}>
          <CartRow
            item={item}
            surface={surface}
            removing={removingId === item.experienceId}
            onRemove={() => onRemove(item.experienceId)}
            primaryAction={
              <Link
                to="/dashboard/cart/checkout/$slug"
                params={{ slug: item.slug }}
                search={
                  item.slotId ? { slotId: item.slotId, guests: item.guests ?? 1 } : undefined
                }
                className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2"
              >
                Buy
                <ArrowRight className="h-3.5 w-3.5" />
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
  surface?: Surface;
};

export function WishlistCartSection({
  items,
  cartExperienceIds,
  removingId,
  addingId,
  onRemove,
  onAddToCart,
  surface = "dark",
}: WishlistCartSectionProps) {
  const isLight = surface === "light";

  if (items.length === 0) {
    return (
      <div className="py-14 text-center">
        <Heart
          className={`mx-auto h-7 w-7 ${isLight ? "text-[#C8A25A]/70" : "text-[#D4AF6A]/45"}`}
          strokeWidth={1.5}
        />
        <p className={`mt-4 font-display text-lg tracking-wide ${isLight ? "luxury-panel-heading" : "text-foreground"}`}>
          No saved experiences yet
        </p>
        <p className={`mt-2 text-xs leading-relaxed ${isLight ? "luxury-panel-body" : "text-muted-foreground/90"}`}>
          Use the heart on any experience to build your wishlist.
        </p>
      </div>
    );
  }

  return (
    <ul className={isLight ? "divide-y divide-[#C8A25A]/22" : "divide-y divide-[#C8A25A]/12"}>
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
              surface={surface}
              removing={removingId === item.experienceId}
              onRemove={() => onRemove(item.experienceId)}
              removeLabel="Remove from wishlist"
              removeIcon={
                <Heart
                  className={`h-4 w-4 fill-current ${isLight ? "text-[#9A7228]" : "text-[#D4AF6A]"}`}
                  strokeWidth={1.5}
                />
              }
              primaryAction={
                <button
                  type="button"
                  disabled={inCart || addingId === item.experienceId}
                  onClick={() => onAddToCart(item)}
                  className={`text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-default disabled:opacity-45 ${
                    isLight
                      ? "luxury-panel-link hover:text-[#4A0000]"
                      : "text-[#D4AF6A]/85 hover:text-[#F7F1E8]"
                  }`}
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
  surface?: Surface;
  removing: boolean;
  onRemove: () => void;
  primaryAction: ReactNode;
  removeLabel?: string;
  removeIcon?: ReactNode;
};

function CartRow({
  item,
  surface = "dark",
  removing,
  onRemove,
  primaryAction,
  removeLabel = "Remove from cart",
  removeIcon = <Trash2 className="h-4 w-4" strokeWidth={1.5} />,
}: CartRowProps) {
  const isLight = surface === "light";

  return (
    <article className="group py-6 sm:py-7">
      <div className="flex gap-5 sm:gap-7">
        <Link
          to="/experiences/$slug"
          params={{ slug: item.slug }}
          className="relative h-[5.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-sm sm:h-28 sm:w-[6.5rem] border border-[rgb(200_162_90/0.28)]"
        >
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="min-w-0">
            <div className={`eyebrow text-[0.62rem] ${isLight ? "luxury-panel-label" : "text-[#D4AF6A]/85"}`}>
              {item.city}
            </div>
            <Link
              to="/experiences/$slug"
              params={{ slug: item.slug }}
              className={`mt-1 block font-display text-base uppercase leading-snug tracking-[0.05em] transition-colors sm:text-lg ${
                isLight
                  ? "luxury-panel-heading hover:text-[#9A7228]"
                  : "text-[#F7F1E8] hover:text-[#D4AF6A]"
              }`}
            >
              {item.title}
            </Link>
            {item.tagline ? (
              <p className={`mt-1.5 line-clamp-2 text-xs leading-relaxed ${isLight ? "luxury-panel-body" : "text-muted-foreground/90"}`}>
                {item.tagline}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <span className={`font-display text-xl tracking-tight sm:text-2xl ${isLight ? "luxury-panel-heading" : "text-[#F7F1E8]"}`}>
              From {item.currencySymbol}
              {item.pricePerPerson.toLocaleString("en-IN")}
            </span>
            <div className="flex items-center gap-4">
              {primaryAction}
              <button
                type="button"
                disabled={removing}
                onClick={onRemove}
                className={`inline-flex items-center justify-center transition-colors disabled:opacity-40 ${
                  isLight
                    ? "luxury-panel-body hover:text-[#9A7228]"
                    : "text-muted-foreground/70 hover:text-[#D4AF6A]"
                }`}
                aria-label={removeLabel}
              >
                {removeIcon}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
