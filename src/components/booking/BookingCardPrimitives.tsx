import type { ReactNode } from "react";

export type BookingCardSurface = "light" | "dark";

export const bookingCardRowClass = "group py-3.5 sm:py-7";

export const bookingCardLayoutClass = "flex gap-3 sm:gap-7";

export const bookingCardContentClass = "flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-4";

export const bookingCardThumbClass =
  "h-16 w-[3.35rem] shrink-0 rounded-[var(--radius-sm)] border border-[color:rgba(198,161,91,0.28)] object-cover sm:h-28 sm:w-[6.5rem]";

export const bookingCardThumbPlaceholderClass =
  "h-16 w-[3.35rem] shrink-0 rounded-[var(--radius-sm)] border border-[color:rgba(198,161,91,0.28)] bg-[color:rgba(58,8,15,0.06)] sm:h-28 sm:w-[6.5rem]";

export function bookingCardTitleClass(surface: BookingCardSurface) {
  return `font-display leading-snug tracking-[0.03em] ${
    surface === "light" ? "luxury-panel-heading text-[0.82rem] sm:text-lg" : "text-base sm:text-lg"
  }`;
}

export function bookingCardSubtitleClass(surface: BookingCardSurface) {
  return `mt-0.5 text-[0.65rem] leading-snug sm:mt-1 sm:text-xs ${
    surface === "light" ? "luxury-panel-body" : "text-muted-foreground"
  }`;
}

export function bookingCardMetaLabelClass(surface: BookingCardSurface) {
  return `eyebrow text-[0.62rem] tracking-[0.12em] sm:text-[0.7rem] sm:tracking-[0.14em] ${
    surface === "light" ? "luxury-panel-label" : "text-muted-foreground"
  }`;
}

export function bookingCardMetaValueClass(surface: BookingCardSurface, emphasis = false) {
  if (emphasis) {
    return `mt-0.5 font-display text-sm sm:mt-1 sm:text-lg ${
      surface === "light" ? "luxury-panel-heading" : ""
    }`;
  }
  return `mt-0.5 text-[0.7rem] leading-snug sm:mt-1 sm:text-sm ${
    surface === "light" ? "luxury-panel-body" : ""
  }`;
}

export function bookingCardPrimaryActionClass(surface: BookingCardSurface) {
  return surface === "light"
    ? "luxury-btn-sm luxury-btn-primary inline-flex min-h-0 flex-1 items-center justify-center px-2.5 py-1.5 text-[0.58rem] tracking-[0.08em] no-underline sm:flex-none sm:px-4 sm:py-2 sm:text-[0.65rem] sm:tracking-[0.1em]"
    : "text-sm text-[color:var(--antique-gold)] underline-offset-4 hover:text-[color:var(--soft-champagne)] hover:underline";
}

export function bookingCardSecondaryActionClass(surface: BookingCardSurface) {
  return surface === "light"
    ? "luxury-btn-sm dashboard-chrome-btn inline-flex min-h-0 flex-1 items-center justify-center px-2.5 py-1.5 text-[0.58rem] tracking-[0.08em] no-underline sm:flex-none sm:px-4 sm:py-2 sm:text-[0.65rem] sm:tracking-[0.1em]"
    : "text-sm text-[color:var(--antique-gold)] underline-offset-4 hover:text-[color:var(--soft-champagne)] hover:underline";
}

export function bookingCardDangerActionClass(surface: BookingCardSurface) {
  return surface === "light"
    ? "luxury-btn-sm luxury-btn-panel-danger min-h-0 flex-1 px-2.5 py-1.5 text-[0.58rem] tracking-[0.08em] sm:flex-none sm:px-4 sm:py-2 sm:text-[0.65rem] sm:tracking-[0.1em]"
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
    <dl
      className={`grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 sm:gap-2 sm:text-sm ${
        surface === "light" ? "" : ""
      }`}
    >
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
    <div className="min-w-0">
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
    <div
      className={`flex flex-wrap items-center gap-1.5 sm:gap-3 ${
        surface === "light" ? "mt-0.5" : "mt-3 sm:mt-5"
      }`}
    >
      {children}
    </div>
  );
}
