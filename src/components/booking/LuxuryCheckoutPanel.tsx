import type { ReactNode } from "react";

/** Thin ivory border panel for premium checkout sections. */
export function LuxuryCheckoutPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-sm border border-[#F7F1E8]/14 bg-[#F7F1E8]/[0.025] p-6 shadow-[inset_0_1px_0_rgba(247,241,232,0.08)] backdrop-blur-sm sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
