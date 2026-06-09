import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import { cancelBooking, fetchBookingById, type BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatDateLong, formatDateWeekdayShort } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Search = {
  confirmed?: boolean;
};

export const Route = createFileRoute("/bookings/$bookingId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    confirmed: s.confirmed === true || s.confirmed === "true",
  }),
  head: () => ({
    meta: [{ title: "Booking — The Royal Passage" }],
  }),
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { bookingId } = Route.useParams();
  const { confirmed } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuthUser();
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }

    void (async () => {
      try {
        const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Please sign in again.");

        if (!isApiConfigured()) {
          throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
        }
        const row = await fetchBookingById(token, bookingId);
        setBooking(row);
      } catch (err) {
        setLoadError(toErrorMessage(err, "Failed to load booking."));
      }
    })();
  }, [bookingId, loading, navigate, user]);

  const handleCancel = async () => {
    if (!booking || !user) return;
    setCancelling(true);
    try {
      const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again.");

      const updated = await cancelBooking(token, bookingId);
      setBooking(updated);
    } catch (err) {
      setLoadError(toErrorMessage(err, "Failed to cancel booking."));
    } finally {
      setCancelling(false);
    }
  };

  if (loading || (!booking && !loadError)) {
    return <div className="min-h-screen pt-[var(--header-height)]" />;
  }

  if (loadError || !booking) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] text-foreground">
        <Header />
        <div className="container-page py-20">
          <p className="text-destructive">{loadError ?? "Booking not found."}</p>
          <Link to="/dashboard/history" className="mt-4 inline-block text-ember hover:underline">
            View booking history
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const canCancel = ["pending", "confirmed"].includes(booking.bookingStatus);

  return (
    <div className="min-h-screen pt-[var(--header-height)] text-foreground">
      <Header />

      <section className="container-page py-12 sm:py-16 max-w-3xl">
        {confirmed ? (
          <div className="mb-8 rounded-sm border border-ember/30 bg-ember/10 px-5 py-4">
            <div className="eyebrow text-ember">Booking requested</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Your request has been sent. The host will confirm shortly. Pay at the venue on
              arrival.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow mb-2 text-muted-foreground">Booking reference</div>
            <h1 className="font-display text-3xl sm:text-4xl">{booking.experience.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ref: {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <BookingStatusChip
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
          />
        </div>

        {booking.experience.image ? (
          <img
            src={booking.experience.image}
            alt=""
            className="mt-8 aspect-[16/7] w-full rounded-md object-cover"
          />
        ) : null}

        <div className="glass-strong mt-8 rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8">
          <dl className="grid gap-5 sm:grid-cols-2 text-sm">
            <div>
              <dt className="eyebrow text-muted-foreground">When</dt>
              <dd className="mt-1 font-display text-lg">
                {formatDateWeekdayShort(booking.slot.date)}, {booking.slot.start}
              </dd>
              <dd className="text-xs text-muted-foreground">{formatDateLong(booking.slot.date)}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Where</dt>
              <dd className="mt-1">{booking.experience.address || booking.experience.city}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Host</dt>
              <dd className="mt-1">{booking.experience.hostName}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Guests</dt>
              <dd className="mt-1">{booking.participantCount}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Total</dt>
              <dd className="mt-1 font-display text-2xl">
                {formatMoney(booking.totalAmount, booking.currencySymbol)}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Payment</dt>
              <dd className="mt-1 capitalize">
                {booking.paymentMethod === "cod" ? "Pay at venue" : booking.paymentMethod}
                {booking.paymentStatus === "paid" ? " · Paid" : " · Pending"}
              </dd>
            </div>
          </dl>

          {booking.notes ? (
            <div className="mt-6 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-5">
              <div className="eyebrow text-muted-foreground">Your notes</div>
              <p className="mt-2 text-sm">{booking.notes}</p>
            </div>
          ) : null}

          <div className="mt-6">
            <PayAtVenueBadge />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          {booking.bookingStatus === "completed" ? (
            <Link
              to="/bookings/$bookingId/review"
              params={{ bookingId: booking.id }}
              className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)]"
            >
              Leave a review
            </Link>
          ) : null}
          <Link
            to="/dashboard/history"
            className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)]"
          >
            Booking history
          </Link>
          <Link
            to="/experiences/$slug"
            params={{ slug: booking.experience.slug }}
            className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-5 py-3 text-sm hover:border-ember/50"
          >
            View experience
          </Link>
          {canCancel ? (
            <button
              type="button"
              disabled={cancelling}
              onClick={() => void handleCancel()}
              className="rounded-sm border border-destructive/40 px-5 py-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-60"
            >
              {cancelling ? "Cancelling…" : "Cancel booking"}
            </button>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
}
