import type { ReactNode } from "react";

/** Cream-white panel for premium checkout & cart on burgundy backgrounds. */
export function LuxuryCheckoutPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`luxury-checkout-panel p-7 sm:p-9 ${className}`}>{children}</div>
  );
}
