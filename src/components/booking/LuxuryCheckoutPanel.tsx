import type { ReactNode } from "react";
import { CornerFiligree } from "@/components/site/RoyalHeritageDecor";

/** Cream-white panel for premium checkout & cart on burgundy backgrounds. */
export function LuxuryCheckoutPanel({
  children,
  className = "",
  compact = false,
  ornate = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
  ornate?: boolean;
}) {
  const padding = compact
    ? "p-2 sm:p-2.5 md:p-3"
    : ornate
      ? "px-4 pb-4 pt-6 sm:px-8 sm:pb-8 sm:pt-8 md:px-10 md:pb-10 md:pt-9"
      : "p-3 sm:p-7 md:p-9";

  return (
    <div
      className={`luxury-checkout-panel text-[#2A0000] ${
        ornate ? "luxury-checkout-panel--ledger" : ""
      } ${padding} ${className}`.trim()}
    >
      {ornate ? (
        <>
          <span className="luxury-ledger-frame" aria-hidden />
          <CornerFiligree className="luxury-ledger-corner luxury-ledger-corner--tl" />
          <CornerFiligree className="luxury-ledger-corner luxury-ledger-corner--tr" />
          <CornerFiligree className="luxury-ledger-corner luxury-ledger-corner--bl" />
          <CornerFiligree className="luxury-ledger-corner luxury-ledger-corner--br" />
        </>
      ) : null}
      <div className={ornate ? "relative z-[1]" : undefined}>{children}</div>
    </div>
  );
}
