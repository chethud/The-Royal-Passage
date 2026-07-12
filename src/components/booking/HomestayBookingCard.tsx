import { Link } from "@tanstack/react-router";
import { House } from "lucide-react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import {
  BookingCardActions,
  BookingCardMetaGrid,
  BookingCardMetaItem,
  bookingCardContentClass,
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
import { HomestayCashPaymentNotice } from "@/components/homestays/HomestayCashPaymentNotice";
import { HomestayRejectionNotice } from "@/components/homestays/HomestayRejectionNotice";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type HomestayBookingCardProps = {
  booking: HomestayBookingSummary;
  surface?: BookingCardSurface;
};

export function HomestayBookingCard({ booking, surface = "light" }: HomestayBookingCardProps) {
  const isLight = surface === "light";
  const imageUrl = booking.homestayImageUrl?.trim() || null;

  return (
    <article className={isLight ? bookingCardRowClass : "glass-strong overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-4"}>
      <div className={isLight ? bookingCardLayoutClass : "space-y-4"}>
        {isLight ? (
          imageUrl ? (
            <img
              src={imageUrl}
              alt={booking.homestayTitle}
              className={`${bookingCardThumbClass} object-center`}
              loading="lazy"
            />
          ) : (
            <div
              className={`${bookingCardThumbPlaceholderClass} flex items-center justify-center`}
              aria-hidden
            >
              <House className="h-7 w-7 text-[rgb(74_0_0/0.35)]" strokeWidth={1.5} />
            </div>
          )
        ) : null}

        <div className={isLight ? bookingCardContentClass : "space-y-4"}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={bookingCardTitleClass(surface)}>
                {booking.homestaySlug ? (
                  <Link
                    to="/homestays/$slug"
                    params={{ slug: booking.homestaySlug }}
                    className="transition-colors hover:text-ember"
                  >
                    {booking.homestayTitle}
                  </Link>
                ) : (
                  booking.homestayTitle
                )}
              </h3>
              <p className={bookingCardSubtitleClass(surface)}>
                {booking.roomName ? `${booking.roomName} · ` : ""}
                Cash at homestay
              </p>
            </div>
            <BookingStatusChip
              bookingStatus={booking.bookingStatus}
              paymentStatus={booking.paymentStatus}
              pendingPaymentLabel="Pay in cash"
              surface={surface}
            />
          </div>

          <BookingCardMetaGrid surface={surface}>
            <BookingCardMetaItem label="Stay" surface={surface}>
              {formatDateLong(booking.checkIn)} → {formatDateLong(booking.checkOut)}
            </BookingCardMetaItem>
            <BookingCardMetaItem label="Guests" surface={surface}>
              {booking.guestCount} guest{booking.guestCount !== 1 ? "s" : ""} · {booking.nights} night
              {booking.nights !== 1 ? "s" : ""}
            </BookingCardMetaItem>
            <BookingCardMetaItem label="Total" surface={surface} emphasis>
              {formatMoney(booking.totalAmount, booking.currencySymbol)}
            </BookingCardMetaItem>
          </BookingCardMetaGrid>

          <HomestayRejectionNotice booking={booking} surface={surface} />

          <HomestayCashPaymentNotice booking={booking} surface={surface} />

          <BookingCardActions surface={surface}>
            {booking.homestaySlug ? (
              <Link
                to="/homestays/$slug"
                params={{ slug: booking.homestaySlug }}
                className={bookingCardPrimaryActionClass(surface)}
              >
                View homestay
              </Link>
            ) : null}
            <Link
              to="/stays/$bookingId"
              params={{ bookingId: booking.id }}
              className={bookingCardSecondaryActionClass(surface)}
            >
              Stay details
            </Link>
          </BookingCardActions>
        </div>
      </div>
    </article>
  );
}
