import type { ReactNode } from "react";

/** Cream ivory panel for premium checkout on burgundy backgrounds. */
export function LuxuryCheckoutPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`luxury-checkout-panel p-6 sm:p-8 ${className}`}>{children}</div>
  );
}
