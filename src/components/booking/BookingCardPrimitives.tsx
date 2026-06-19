import type { ReactNode } from "react";

export type BookingCardSurface = "light" | "dark";

export const bookingCardRowClass = "group py-6 sm:py-7";

export const bookingCardLayoutClass = "flex gap-5 sm:gap-7";

export const bookingCardContentClass = "flex min-w-0 flex-1 flex-col gap-4";

export const bookingCardThumbClass =
  "h-[5.5rem] w-[4.5rem] shrink-0 rounded-sm border border-[rgb(200_162_90/0.28)] object-cover sm:h-28 sm:w-[6.5rem]";

export const bookingCardThumbPlaceholderClass =
  "h-[5.5rem] w-[4.5rem] shrink-0 rounded-sm border border-[rgb(200_162_90/0.28)] bg-[rgb(74_0_0/0.06)] sm:h-28 sm:w-[6.5rem]";

export function bookingCardTitleClass(surface: BookingCardSurface) {
  return `font-display leading-snug uppercase tracking-[0.05em] ${
    surface === "light" ? "luxury-panel-heading text-base sm:text-lg" : "text-lg"
  }`;
}

export function bookingCardSubtitleClass(surface: BookingCardSurface) {
  return `mt-1 text-xs ${surface === "light" ? "luxury-panel-body" : "text-muted-foreground"}`;
}

export function bookingCardMetaLabelClass(surface: BookingCardSurface) {
  return `eyebrow ${surface === "light" ? "luxury-panel-label" : "text-muted-foreground"}`;
}

export function bookingCardMetaValueClass(surface: BookingCardSurface, emphasis = false) {
  if (emphasis) {
    return `mt-1 font-display text-lg ${surface === "light" ? "luxury-panel-heading" : ""}`;
  }
  return `mt-1 ${surface === "light" ? "luxury-panel-body" : ""}`;
}

export function bookingCardPrimaryActionClass(surface: BookingCardSurface) {
  return surface === "light"
    ? "luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
    : "text-sm text-ember underline-offset-4 hover:underline";
}

export function bookingCardSecondaryActionClass(surface: BookingCardSurface) {
  return surface === "light"
    ? "luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
    : "text-sm text-ember underline-offset-4 hover:underline";
}

export function bookingCardDangerActionClass(surface: BookingCardSurface) {
  return surface === "light"
    ? "luxury-btn-sm luxury-btn-panel-danger"
    : "text-sm text-destructive underline-offset-4 hover:underline disabled:opacity-60";
}

export function BookingCardMetaGrid({
  children,
  surface = "light",
}: {
  children: ReactNode;
  surface?: BookingCardSurface;
}) {
  return (
    <dl className={`grid gap-3 text-xs sm:grid-cols-3 sm:gap-2 ${surface === "light" ? "sm:text-sm" : "sm:text-sm"}`}>
      {children}
    </dl>
  );
}

export function BookingCardMetaItem({
  label,
  children,
  surface = "light",
  emphasis = false,
}: {
  label: string;
  children: ReactNode;
  surface?: BookingCardSurface;
  emphasis?: boolean;
}) {
  return (
    <div>
      <dt className={bookingCardMetaLabelClass(surface)}>{label}</dt>
      <dd className={bookingCardMetaValueClass(surface, emphasis)}>{children}</dd>
    </div>
  );
}

export function BookingCardActions({
  children,
  surface = "light",
}: {
  children: ReactNode;
  surface?: BookingCardSurface;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${surface === "light" ? "mt-1" : "mt-5"}`}>
      {children}
    </div>
  );
}
