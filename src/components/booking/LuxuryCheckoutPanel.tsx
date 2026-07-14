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
      className={`luxury-checkout-panel text-[#2A0000] ${
        compact ? "p-2 sm:p-2.5 md:p-3" : "p-3 sm:p-7 md:p-9"
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
