import type { ReactNode } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { RoyalCheckoutEmblem } from "@/components/booking/RoyalCheckoutEmblem";

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
    <LuxuryCheckoutPanel className={`royal-checkout-header relative overflow-hidden ${className}`}>
      <RoyalCheckoutEmblem className="royal-checkout-header__watermark" />

      <div className="relative z-10 max-w-[62%] sm:max-w-[58%]">
        <div className="eyebrow luxury-panel-label">{label}</div>
        <TitleTag className="luxury-panel-heading mt-2 font-display text-2xl uppercase leading-tight tracking-[0.05em] sm:text-3xl">
          {title}
        </TitleTag>
        <p className="luxury-panel-body mt-2 text-sm">{meta}</p>
        {children}
      </div>
    </LuxuryCheckoutPanel>
  );
}
