import { Link } from "@tanstack/react-router";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { BookingSummary } from "@/lib/api/bookings";
import { formatMoney } from "@/lib/money";
import { formatDateLong } from "@/lib/date-format";

type BookingCardProps = {
  booking: BookingSummary;
  showActions?: boolean;
  onCancel?: (bookingId: string) => void;
  cancelling?: boolean;
};

export function BookingCard({ booking, showActions, onCancel, cancelling }: BookingCardProps) {
  const canCancel = ["pending", "confirmed"].includes(booking.bookingStatus);

  return (
    <article className="glass-strong overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.15)]">
      <div className="grid gap-0 sm:grid-cols-[96px_1fr]">
        {booking.experience.image ? (
          <img
            src={booking.experience.image}
            alt=""
            className="h-24 w-full object-cover sm:h-full sm:min-h-[96px]"
          />
        ) : (
          <div className="h-24 bg-muted sm:h-full sm:min-h-[96px]" />
        )}
        <div className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-lg leading-snug">{booking.experience.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {booking.experience.city} · {booking.experience.hostName}
              </p>
            </div>
            <BookingStatusChip
              bookingStatus={booking.bookingStatus}
              paymentStatus={booking.paymentStatus}
            />
          </div>

          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3 sm:text-sm">
            <div>
              <dt className="eyebrow text-muted-foreground">When</dt>
              <dd className="mt-1">
                {formatDateLong(booking.slot.date)}, {booking.slot.start}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Guests</dt>
              <dd className="mt-1">{booking.participantCount}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Total</dt>
              <dd className="mt-1 font-display text-lg">
                {formatMoney(booking.totalAmount, booking.currencySymbol)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/bookings/$bookingId"
              params={{ bookingId: booking.id }}
              className="text-sm text-ember underline-offset-4 hover:underline"
            >
              View details
            </Link>
            {booking.bookingStatus === "completed" ? (
              <Link
                to="/bookings/$bookingId/review"
                params={{ bookingId: booking.id }}
                className="text-sm text-ember underline-offset-4 hover:underline"
              >
                Leave a review
              </Link>
            ) : null}
            {showActions && canCancel && onCancel ? (
              <button
                type="button"
                disabled={cancelling}
                onClick={() => onCancel(booking.id)}
                className="text-sm text-destructive underline-offset-4 hover:underline disabled:opacity-60"
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
