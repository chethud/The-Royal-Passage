import { Link } from "@tanstack/react-router";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import {
  BookingCardActions,
  BookingCardMetaGrid,
  BookingCardMetaItem,
  bookingCardContentClass,
  bookingCardDangerActionClass,
  bookingCardLayoutClass,
  bookingCardPrimaryActionClass,
  bookingCardRowClass,
  bookingCardSecondaryActionClass,
  bookingCardSubtitleClass,
  bookingCardThumbClass,
  bookingCardThumbPlaceholderClass,
  bookingCardTitleClass,
  type BookingCardSurface,
} from "@/components/booking/BookingCardPrimitives";
import type { BookingSummary } from "@/lib/api/bookings";
import { experienceDetailSlug } from "@/lib/experience-path";
import { hasExperienceDetailLink } from "@/lib/booking-normalize";
import { formatMoney } from "@/lib/money";
import { formatDateLong } from "@/lib/date-format";

type BookingCardProps = {
  booking: BookingSummary;
  showActions?: boolean;
  onCancel?: (bookingId: string) => void;
  cancelling?: boolean;
  surface?: BookingCardSurface;
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
    <article
      className={
        isLight
          ? bookingCardRowClass
          : "glass-strong overflow-hidden rounded-[var(--radius-lg)] border border-[color:rgba(198,161,91,0.15)]"
      }
    >
      <div className={isLight ? bookingCardLayoutClass : "grid gap-0 sm:grid-cols-[96px_1fr]"}>
        {booking.experience.image ? (
          <img
            src={booking.experience.image}
            alt=""
            className={
              isLight
                ? bookingCardThumbClass
                : "h-24 w-full object-cover sm:h-full sm:min-h-[96px]"
            }
          />
        ) : (
          <div
            className={
              isLight
                ? bookingCardThumbPlaceholderClass
                : "h-24 bg-muted sm:h-full sm:min-h-[96px]"
            }
          />
        )}
        <div className={isLight ? bookingCardContentClass : "p-4"}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={bookingCardTitleClass(surface)}>
                {canViewExperience && experienceSlug ? (
                  <Link
                    to="/experiences/$slug"
                    params={{ slug: experienceSlug }}
                    className="transition-colors hover:text-[color:var(--soft-champagne)]"
                  >
                    {booking.experience.title}
                  </Link>
                ) : (
                  booking.experience.title
                )}
              </h3>
              <p className={bookingCardSubtitleClass(surface)}>
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

          <BookingCardMetaGrid surface={surface}>
            <BookingCardMetaItem label="When" surface={surface}>
              {formatDateLong(booking.slot.date)}, {booking.slot.start}
            </BookingCardMetaItem>
            <BookingCardMetaItem label="Guests" surface={surface}>
              {booking.participantCount}
            </BookingCardMetaItem>
            <BookingCardMetaItem label="Total" surface={surface} emphasis>
              {formatMoney(booking.totalAmount, booking.currencySymbol)}
            </BookingCardMetaItem>
          </BookingCardMetaGrid>

          <BookingCardActions surface={surface}>
            {canViewExperience && experienceSlug ? (
              <Link
                to="/experiences/$slug"
                params={{ slug: experienceSlug }}
                className={bookingCardPrimaryActionClass(surface)}
              >
                View experience
              </Link>
            ) : null}
            <Link
              to="/bookings/$bookingId"
              params={{ bookingId: booking.id }}
              className={bookingCardSecondaryActionClass(surface)}
            >
              Booking details
            </Link>
            {booking.bookingStatus === "completed" ? (
              <Link
                to="/bookings/$bookingId/review"
                params={{ bookingId: booking.id }}
                className={bookingCardPrimaryActionClass(surface)}
              >
                Leave a review
              </Link>
            ) : null}
            {showActions && canCancel && onCancel ? (
              <button
                type="button"
                disabled={cancelling}
                onClick={() => onCancel(booking.id)}
                className={bookingCardDangerActionClass(surface)}
              >
                {cancelling ? "Cancelling…" : "Cancel booking"}
              </button>
            ) : null}
          </BookingCardActions>
        </div>
      </div>
    </article>
  );
}
