import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShoppingCart, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { WishlistItem } from "@/lib/api/wishlist";
import type { CartItem, ExperienceCartItem } from "@/lib/cart-storage";
import { buildHomestayBookSearch } from "@/lib/homestay-booking-url";

type Surface = "light" | "dark";

type CartItemsSectionProps = {
  items: CartItem[];
  removingId: string | null;
  onRemove: (id: string) => void;
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
          Add experiences and a homestay to build a Mysuru itinerary, then book each when ready.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/experiences"
            className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2"
          >
            Browse experiences
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/homestays"
            className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center gap-2 no-underline"
          >
            Browse stays
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className={isLight ? "divide-y divide-[#C8A25A]/22" : "divide-y divide-[#C8A25A]/12"}>
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`}>
          {item.kind === "experience" ? (
            <ExperienceCartRow
              item={item}
              surface={surface}
              removing={removingId === item.id}
              onRemove={() => onRemove(item.id)}
            />
          ) : (
            <HomestayCartRow
              item={item}
              surface={surface}
              removing={removingId === item.id}
              onRemove={() => onRemove(item.id)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

function ExperienceCartRow({
  item,
  surface,
  removing,
  onRemove,
}: {
  item: ExperienceCartItem;
  surface: Surface;
  removing: boolean;
  onRemove: () => void;
}) {
  return (
    <CartRow
      kindLabel="Experience"
      title={item.title}
      tagline={item.tagline}
      city={item.city}
      image={item.image}
      priceLabel={`From ${item.currencySymbol}${item.pricePerPerson.toLocaleString("en-IN")}`}
      detailTo="/experiences/$slug"
      detailParams={{ slug: item.slug }}
      surface={surface}
      removing={removing}
      onRemove={onRemove}
      primaryAction={
        <Link
          to="/dashboard/cart/checkout/$slug"
          params={{ slug: item.slug }}
          search={item.slotId ? { slotId: item.slotId, guests: item.guests ?? 1 } : undefined}
          className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2"
        >
          Book
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    />
  );
}

function HomestayCartRow({
  item,
  surface,
  removing,
  onRemove,
}: {
  item: Extract<CartItem, { kind: "homestay" }>;
  surface: Surface;
  removing: boolean;
  onRemove: () => void;
}) {
  const dates =
    item.checkIn && item.checkOut ? `${item.checkIn} → ${item.checkOut}` : item.tagline;

  return (
    <CartRow
      kindLabel="Homestay"
      title={item.title}
      tagline={dates}
      city={item.city}
      image={item.image}
      priceLabel={`From ${item.currencySymbol}${item.pricePerNight.toLocaleString("en-IN")}/night`}
      detailTo="/homestays/$slug"
      detailParams={{ slug: item.slug }}
      surface={surface}
      removing={removing}
      onRemove={onRemove}
      primaryAction={
        <Link
          to="/homestays/$slug/book"
          params={{ slug: item.slug }}
          search={buildHomestayBookSearch({
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            guests: item.guests,
          })}
          className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2"
        >
          Book stay
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    />
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
              kindLabel="Experience"
              title={item.experience.title}
              tagline={item.experience.tagline ?? undefined}
              city={item.experience.city}
              image={item.experience.image}
              priceLabel={`From ${item.experience.currencySymbol}${item.experience.pricePerPerson.toLocaleString("en-IN")}`}
              detailTo="/experiences/$slug"
              detailParams={{ slug: item.experience.slug }}
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
  kindLabel: string;
  title: string;
  tagline?: string;
  city: string;
  image: string;
  priceLabel: string;
  detailTo: "/experiences/$slug" | "/homestays/$slug";
  detailParams: { slug: string };
  surface?: Surface;
  removing: boolean;
  onRemove: () => void;
  primaryAction: ReactNode;
  removeLabel?: string;
  removeIcon?: ReactNode;
};

function CartRow({
  kindLabel,
  title,
  tagline,
  city,
  image,
  priceLabel,
  detailTo,
  detailParams,
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
          to={detailTo}
          params={detailParams}
          className="relative h-[5.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-sm border border-[rgb(200_162_90/0.28)] sm:h-28 sm:w-[6.5rem]"
        >
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="min-w-0">
            <div className={`eyebrow text-[0.62rem] ${isLight ? "luxury-panel-label" : "text-[#D4AF6A]/85"}`}>
              {kindLabel} · {city}
            </div>
            <Link
              to={detailTo}
              params={detailParams}
              className={`mt-1 block font-display text-base uppercase leading-snug tracking-[0.05em] transition-colors sm:text-lg ${
                isLight
                  ? "luxury-panel-heading hover:text-[#9A7228]"
                  : "text-[#F7F1E8] hover:text-[#D4AF6A]"
              }`}
            >
              {title}
            </Link>
            {tagline ? (
              <p
                className={`mt-1.5 line-clamp-2 text-xs leading-relaxed ${isLight ? "luxury-panel-body" : "text-muted-foreground/90"}`}
              >
                {tagline}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <span
              className={`font-display text-xl tracking-tight sm:text-2xl ${isLight ? "luxury-panel-heading" : "text-[#F7F1E8]"}`}
            >
              {priceLabel}
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
