import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HomestayCashPaymentNotice } from "@/components/homestays/HomestayCashPaymentNotice";
import { PayAtHomestayBadge } from "@/components/homestays/PayAtHomestayBadge";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import {
  cancelGuestHomestayBooking,
  fetchGuestHomestayBooking,
} from "@/lib/api/guest-homestay-bookings";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { formatTime12h } from "@/lib/weekday-slots";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Search = {
  confirmed?: boolean;
};

export const Route = createFileRoute("/stays/$bookingId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    confirmed: s.confirmed === true || s.confirmed === "true",
  }),
  head: () => ({
    meta: [{ title: "Stay booking — The Royal Passage" }],
  }),
  component: StayBookingDetailPage,
});

function StayBookingDetailPage() {
  const { bookingId } = Route.useParams();
  const { confirmed } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuthUser();
  const [booking, setBooking] = useState<HomestayBookingSummary | null>(null);
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
        setBooking(await fetchGuestHomestayBooking(token, bookingId));
      } catch (err) {
        setLoadError(toErrorMessage(err, "Failed to load stay booking."));
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
      const updated = await cancelGuestHomestayBooking(token, bookingId);
      setBooking(updated);
    } catch (err) {
      setLoadError(toErrorMessage(err, "Failed to cancel stay."));
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  const sym = booking?.currencySymbol ?? "₹";
  const canCancel = booking && ["pending", "confirmed"].includes(booking.bookingStatus);

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/dashboard/history"
            className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]/85 hover:text-[#F7F1E8]"
          >
            ← Booking history
          </Link>

          {confirmed ? (
            <p className="mt-6 rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.08)] px-4 py-3 text-sm text-muted-foreground">
              Your stay request was submitted. The host will confirm shortly.
            </p>
          ) : null}

          {loadError ? (
            <LuxuryCheckoutPanel className="mt-8">
              <p className="text-sm text-destructive">{loadError}</p>
            </LuxuryCheckoutPanel>
          ) : !booking ? (
            <LuxuryCheckoutPanel className="mt-8">
              <p className="luxury-panel-body py-8 text-sm">Loading stay…</p>
            </LuxuryCheckoutPanel>
          ) : (
            <LuxuryCheckoutPanel className="mt-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow luxury-panel-label mb-2">Homestay stay</p>
                  <h1 className="luxury-panel-heading font-display text-3xl tracking-tight">{booking.homestayTitle}</h1>
                  {booking.roomName ? (
                    <p className="luxury-panel-body mt-1 text-sm">{booking.roomName}</p>
                  ) : null}
                </div>
                <BookingStatusChip
                  bookingStatus={booking.bookingStatus}
                  paymentStatus={booking.paymentStatus}
                  pendingPaymentLabel="Pay in cash"
                  surface="light"
                />
              </div>

              <dl className="luxury-panel-body mt-8 space-y-4 border-t luxury-panel-divider pt-6 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>Check-in</dt>
                  <dd className="text-right">
                    {formatDateLong(booking.checkIn)}
                    {booking.checkInTime ? ` · from ${formatTime12h(booking.checkInTime)}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Check-out</dt>
                  <dd className="text-right">
                    {formatDateLong(booking.checkOut)}
                    {booking.checkOutTime ? ` · by ${formatTime12h(booking.checkOutTime)}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Guests</dt>
                  <dd>{booking.guestCount}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Total</dt>
                  <dd className="font-display text-xl text-[#4A0000]">{formatMoney(booking.totalAmount, sym)}</dd>
                </div>
                {booking.homestayAddress ? (
                  <div className="flex justify-between gap-4">
                    <dt>Address</dt>
                    <dd className="max-w-[16rem] text-right">{booking.homestayAddress}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-8 space-y-4 border-t luxury-panel-divider pt-6">
                <HomestayCashPaymentNotice booking={booking} surface="light" />
                <PayAtHomestayBadge surface="light" />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {booking.homestaySlug ? (
                  <Link
                    to="/homestays/$slug"
                    params={{ slug: booking.homestaySlug }}
                    className="luxury-btn-sm luxury-btn-panel-outline inline-flex no-underline"
                  >
                    View property
                  </Link>
                ) : null}
                {canCancel ? (
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={() => void handleCancel()}
                    className="luxury-btn-sm luxury-btn-panel-outline disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling…" : "Cancel stay"}
                  </button>
                ) : null}
              </div>
            </LuxuryCheckoutPanel>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
