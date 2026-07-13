import { CartIcon } from "@/components/cart/CartIcon";
import { useState, type MouseEvent } from "react";
import type { Homestay } from "@/data/homestays";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import { cartItemFromHomestay } from "@/lib/cart-storage";
import { useAuthUser } from "@/lib/auth-user";
import type { HomestayBrowseSearch } from "@/lib/homestay-filters";
import { isGuestAccount } from "@/lib/roles";

type AddHomestayToCartButtonProps = {
  stay: Homestay;
  search?: HomestayBrowseSearch;
  className?: string;
};

export function AddHomestayToCartButton({
  stay,
  search,
  className = "",
}: AddHomestayToCartButtonProps) {
  const { user, role } = useAuthUser();
  const { add, hasHomestay } = useExperienceCart();
  const [busy, setBusy] = useState(false);
  const inCart = hasHomestay(stay.id);

  if (user && !isGuestAccount(role)) {
    return null;
  }

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (inCart) return;
    setBusy(true);
    add(cartItemFromHomestay(stay, search));
    window.setTimeout(() => setBusy(false), 350);
  };

  return (
    <button
      type="button"
      disabled={busy || inCart}
      onClick={handleClick}
      className={`rounded-full border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/80 p-2.5 text-foreground backdrop-blur-sm transition-colors hover:border-ember/50 disabled:cursor-default disabled:opacity-100 ${inCart ? "border-ember/50 text-ember" : ""} ${className}`}
      aria-label={inCart ? "Already in cart" : "Add stay to cart"}
      aria-pressed={inCart}
    >
      <CartIcon size={20} className={inCart ? "brightness-110" : "opacity-95"} />
    </button>
  );
}
