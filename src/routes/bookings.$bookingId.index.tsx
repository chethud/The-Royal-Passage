import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import { cancelBooking, fetchBookingById, type BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatBookingExperienceLocation } from "@/lib/booking-normalize";
import { formatDateLong, formatDateWeekdayShort } from "@/lib/date-format";
import { experienceDetailSlug } from "@/lib/experience-path";
import { formatMoney } from "@/lib/money";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Search = {
  confirmed?: boolean;
};

export const Route = createFileRoute("/bookings/$bookingId/")({
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
        <div className="container-page max-w-3xl py-20">
          <LuxuryCheckoutPanel>
            <p className="text-destructive">{loadError ?? "Booking not found."}</p>
            <Link
              to="/dashboard/history"
              className="luxury-btn-sm luxury-btn-panel-outline mt-4 inline-flex items-center no-underline"
            >
              View booking history
            </Link>
          </LuxuryCheckoutPanel>
        </div>
        <Footer />
      </div>
    );
  }

  const canCancel = ["pending", "confirmed"].includes(booking.bookingStatus);
  const experienceSlug = experienceDetailSlug(booking.experience);

  return (
    <div className="min-h-screen pt-[var(--header-height)] text-foreground">
      <Header />

      <section className="container-page max-w-3xl py-12 sm:py-16">
        {confirmed ? (
          <LuxuryCheckoutPanel className="mb-8">
            <div className="eyebrow luxury-panel-label">Booking requested</div>
            <p className="luxury-panel-body mt-2 text-sm leading-relaxed">
              Your request has been sent. The host will confirm shortly. Pay at the venue on
              arrival.
            </p>
          </LuxuryCheckoutPanel>
        ) : null}

        <LuxuryCheckoutPanel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="eyebrow luxury-panel-label">Booking reference</div>
              <h1 className="luxury-panel-heading mt-2 font-display text-2xl uppercase leading-tight tracking-[0.05em] sm:text-3xl">
                {booking.experience.title}
              </h1>
              <p className="luxury-panel-body mt-2 text-sm">
                Ref: {booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <BookingStatusChip
              bookingStatus={booking.bookingStatus}
              paymentStatus={booking.paymentStatus}
              isPaused={booking.isPaused}
              surface="light"
            />
          </div>

          {booking.isPaused ? (
            <p className="luxury-panel-body mt-6 rounded-sm border border-[rgb(88_16_0/0.18)] bg-[rgb(88_16_0/0.04)] px-4 py-3 text-sm">
              Your host temporarily paused this booking. They will notify you when it resumes.
            </p>
          ) : null}

          {booking.experience.image ? (
            <div className="luxury-panel-image mt-8">
              <img
                src={booking.experience.image}
                alt=""
                className="aspect-[16/7] w-full object-cover"
              />
            </div>
          ) : null}

          <dl className="mt-8 grid gap-5 border-t text-sm luxury-panel-divider pt-8 sm:grid-cols-2">
            <div>
              <dt className="eyebrow luxury-panel-label">When</dt>
              <dd className="luxury-panel-heading mt-1 font-display text-lg">
                {formatDateWeekdayShort(booking.slot.date)}, {booking.slot.start}
              </dd>
              <dd className="luxury-panel-body text-xs">{formatDateLong(booking.slot.date)}</dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Where</dt>
              <dd className="luxury-panel-body mt-1">
                {formatBookingExperienceLocation(booking.experience)}
              </dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Host</dt>
              <dd className="luxury-panel-body mt-1">{booking.experience.hostName}</dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Guests</dt>
              <dd className="luxury-panel-body mt-1">{booking.participantCount}</dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Total</dt>
              <dd className="luxury-panel-heading mt-1 font-display text-2xl">
                {formatMoney(booking.totalAmount, booking.currencySymbol)}
              </dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Payment</dt>
              <dd className="luxury-panel-body mt-1 capitalize">
                {booking.paymentMethod === "cod" ? "Pay at venue" : booking.paymentMethod}
                {booking.paymentStatus === "paid" ? " · Paid" : " · Pending"}
              </dd>
            </div>
          </dl>

          {booking.notes ? (
            <div className="mt-6 border-t luxury-panel-divider pt-5">
              <div className="eyebrow luxury-panel-label">Your notes</div>
              <p className="luxury-panel-body mt-2 text-sm">{booking.notes}</p>
            </div>
          ) : null}

          <div className="mt-6 border-t luxury-panel-divider pt-6">
            <PayAtVenueBadge surface="light" />
          </div>
        </LuxuryCheckoutPanel>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {booking.bookingStatus === "completed" ? (
            <Link
              to="/bookings/$bookingId/review"
              params={{ bookingId: booking.id }}
              className="luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
            >
              Leave a review
            </Link>
          ) : null}
          <Link
            to="/dashboard/history"
            className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
          >
            Booking history
          </Link>
          {experienceSlug ? (
            <Link
              to="/experiences/$slug"
              params={{ slug: experienceSlug }}
              search={{}}
              className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
            >
              View experience
            </Link>
          ) : null}
          {canCancel ? (
            <button
              type="button"
              disabled={cancelling}
              onClick={() => void handleCancel()}
              className="luxury-btn-sm luxury-btn-panel-danger"
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
