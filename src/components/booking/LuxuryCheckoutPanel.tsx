import type { ReactNode } from "react";

/** Cream-white panel for premium checkout & cart on burgundy backgrounds. */
export function LuxuryCheckoutPanel({
  children,
  className = "",
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`luxury-checkout-panel ${
        compact ? "p-3 sm:p-3.5 md:p-4" : "p-3 sm:p-7 md:p-9"
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
