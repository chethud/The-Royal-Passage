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
    <div className={`luxury-checkout-panel p-4 sm:p-7 md:p-9 ${className}`}>{children}</div>
  );
}
