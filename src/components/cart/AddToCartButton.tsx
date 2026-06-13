import { ShoppingCart } from "lucide-react";
import { useState, type MouseEvent } from "react";
import type { Experience } from "@/data/experiences";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import { cartItemFromExperience } from "@/lib/cart-storage";
import { useAuthUser } from "@/lib/auth-user";
import { isGuestAccount } from "@/lib/roles";

type AddToCartButtonProps = {
  exp: Experience;
  className?: string;
  showLabel?: boolean;
};

export function AddToCartButton({ exp, className = "", showLabel = false }: AddToCartButtonProps) {
  const { user, role } = useAuthUser();
  const { add, has } = useExperienceCart();
  const [busy, setBusy] = useState(false);
  const inCart = has(exp.id);

  if (user && !isGuestAccount(role)) {
    return null;
  }

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (inCart) return;
    setBusy(true);
    add(cartItemFromExperience(exp));
    window.setTimeout(() => setBusy(false), 350);
  };

  return (
    <button
      type="button"
      disabled={busy || inCart}
      onClick={handleClick}
      className={`rounded-full border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/80 p-2.5 text-foreground backdrop-blur-sm transition-colors hover:border-ember/50 disabled:cursor-default disabled:opacity-100 ${inCart ? "border-ember/50 text-ember" : ""} ${className}`}
      aria-label={inCart ? "Already in cart" : "Add to cart"}
      aria-pressed={inCart}
    >
      <span className="flex items-center gap-1.5">
        <ShoppingCart className={`h-4 w-4 ${inCart ? "text-ember" : ""}`} />
        {showLabel ? (
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em]">
            {inCart ? "In cart" : "Add to cart"}
          </span>
        ) : null}
      </span>
    </button>
  );
}
