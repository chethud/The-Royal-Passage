import type { ReactNode } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";

type BookingRequestHeaderProps = {
  label: string;
  title: string;
  meta: string;
  className?: string;
  titleAs?: "h1" | "h2";
  children?: ReactNode;
};

export function BookingRequestHeader({
  label,
  title,
  meta,
  className = "",
  titleAs: TitleTag = "h2",
  children,
}: BookingRequestHeaderProps) {
  return (
    <LuxuryCheckoutPanel className={className}>
      <div className="eyebrow luxury-panel-label">{label}</div>
      <TitleTag className="luxury-panel-heading mt-2 font-display text-2xl uppercase leading-tight tracking-[0.05em] sm:text-3xl">
        {title}
      </TitleTag>
      <p className="luxury-panel-body mt-2 text-sm">{meta}</p>
      {children}
    </LuxuryCheckoutPanel>
  );
}
