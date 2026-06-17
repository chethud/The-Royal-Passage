import { Link } from "@tanstack/react-router";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { BookingSummary } from "@/lib/api/bookings";
import {
  formatBookingExperienceLocation,
  hasExperienceDetailLink,
} from "@/lib/booking-normalize";
import { experienceDetailSlug } from "@/lib/experience-path";
import { formatMoney } from "@/lib/money";
import { formatDateLong } from "@/lib/date-format";

type BookingCardProps = {
  booking: BookingSummary;
  showActions?: boolean;
  onCancel?: (bookingId: string) => void;
  cancelling?: boolean;
  surface?: "light" | "dark";
};

export function BookingCard({
  booking,
  showActions,
  onCancel,
  cancelling,
  surface = "dark",
}: BookingCardProps) {
  const canCancel = ["pending", "confirmed"].includes(booking.bookingStatus);
  const isLight = surface === "light";
  const experienceSlug = experienceDetailSlug(booking.experience);
  const canViewExperience = hasExperienceDetailLink(booking.experience);

  return (
    <article className={isLight ? "group py-6 sm:py-7" : "glass-strong overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.15)]"}>
      <div className={isLight ? "flex gap-5 sm:gap-7" : "grid gap-0 sm:grid-cols-[96px_1fr]"}>
        {booking.experience.image ? (
          <img
            src={booking.experience.image}
            alt=""
            className={
              isLight
                ? "h-[5.5rem] w-[4.5rem] shrink-0 rounded-sm border border-[rgb(201_162_39/0.28)] object-cover sm:h-28 sm:w-[6.5rem]"
                : "h-24 w-full object-cover sm:h-full sm:min-h-[96px]"
            }
          />
        ) : (
          <div
            className={
              isLight
                ? "h-[5.5rem] w-[4.5rem] shrink-0 rounded-sm border border-[rgb(201_162_39/0.28)] bg-[rgb(88_16_0/0.06)] sm:h-28 sm:w-[6.5rem]"
                : "h-24 bg-muted sm:h-full sm:min-h-[96px]"
            }
          />
        )}
        <div className={isLight ? "flex min-w-0 flex-1 flex-col gap-4" : "p-4"}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className={`font-display leading-snug uppercase tracking-[0.05em] ${
                  isLight ? "luxury-panel-heading text-base sm:text-lg" : "text-lg"
                }`}
              >
                {canViewExperience && experienceSlug ? (
                  <Link
                    to="/experiences/$slug"
                    params={{ slug: experienceSlug }}
                    className="transition-colors hover:text-ember"
                  >
                    {booking.experience.title}
                  </Link>
                ) : (
                  booking.experience.title
                )}
              </h3>
              <p className={`mt-1 text-xs ${isLight ? "luxury-panel-body" : "text-muted-foreground"}`}>
                {booking.experience.city} · {booking.experience.hostName}
              </p>
            </div>
            <BookingStatusChip
              bookingStatus={booking.bookingStatus}
              paymentStatus={booking.paymentStatus}
              isPaused={booking.isPaused}
              surface={surface}
            />
          </div>

          <dl className={`grid gap-2 text-xs sm:grid-cols-3 ${isLight ? "sm:text-sm" : "sm:text-sm"}`}>
            <div>
              <dt className={`eyebrow ${isLight ? "luxury-panel-label" : "text-muted-foreground"}`}>When</dt>
              <dd className={`mt-1 ${isLight ? "luxury-panel-body" : ""}`}>
                {formatDateLong(booking.slot.date)}, {booking.slot.start}
              </dd>
            </div>
            <div>
              <dt className={`eyebrow ${isLight ? "luxury-panel-label" : "text-muted-foreground"}`}>Guests</dt>
              <dd className={`mt-1 ${isLight ? "luxury-panel-body" : ""}`}>{booking.participantCount}</dd>
            </div>
            <div>
              <dt className={`eyebrow ${isLight ? "luxury-panel-label" : "text-muted-foreground"}`}>Total</dt>
              <dd className={`mt-1 font-display text-lg ${isLight ? "luxury-panel-heading" : ""}`}>
                {formatMoney(booking.totalAmount, booking.currencySymbol)}
              </dd>
            </div>
          </dl>

          <div className={`flex flex-wrap items-center gap-3 ${isLight ? "mt-1" : "mt-5"}`}>
            {canViewExperience && experienceSlug ? (
              <Link
                to="/experiences/$slug"
                params={{ slug: experienceSlug }}
                className={
                  isLight
                    ? "luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
                    : "text-sm text-ember underline-offset-4 hover:underline"
                }
              >
                View experience
              </Link>
            ) : null}
            <Link
              to="/bookings/$bookingId"
              params={{ bookingId: booking.id }}
              className={
                isLight
                  ? "luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
                  : "text-sm text-ember underline-offset-4 hover:underline"
              }
            >
              Booking details
            </Link>
            {booking.bookingStatus === "completed" ? (
              <Link
                to="/bookings/$bookingId/review"
                params={{ bookingId: booking.id }}
                className={
                  isLight
                    ? "luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
                    : "text-sm text-ember underline-offset-4 hover:underline"
                }
              >
                Leave a review
              </Link>
            ) : null}
            {showActions && canCancel && onCancel ? (
              <button
                type="button"
                disabled={cancelling}
                onClick={() => onCancel(booking.id)}
                className={
                  isLight
                    ? "luxury-btn-sm luxury-btn-panel-danger"
                    : "text-sm text-destructive underline-offset-4 hover:underline disabled:opacity-60"
                }
              >
                {cancelling ? "Cancelling…" : "Cancel booking"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
