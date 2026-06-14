import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminBooking } from "@/lib/api/admin";
import type { BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatDateLong, formatDateWeekdayShort } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/bookings/$bookingId")({
  head: () => ({
    meta: [{ title: "Admin booking detail — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AdminBookingDetailPage,
});

function AdminBookingDetailPage() {
  const navigate = useNavigate();
  const { bookingId } = Route.useParams();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (role && role !== "admin") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  useEffect(() => {
    if (!user) return;
    void getSupabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        setAccessToken(data.session?.access_token ?? null);
      });
  }, [user]);

  const loadBooking = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const row = await fetchAdminBooking(accessToken, bookingId);
      setBooking(row);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load booking."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, bookingId]);

  useEffect(() => {
    if (!accessToken) return;
    void loadBooking();
  }, [accessToken, loadBooking]);

  if (loading || !user || role !== "admin" || !accessToken || pageLoading) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  if (pageError || !booking) {
    return (
      <DashboardShell
        role="admin"
        title="Booking"
        subtitle="Booking details across the platform."
        showRoleDescription={false}
      >
        <LuxuryCheckoutPanel>
          <p className="text-destructive">{pageError ?? "Booking not found."}</p>
          <Link
            to="/admin/bookings"
            className="luxury-btn-sm luxury-btn-panel-outline mt-4 inline-flex items-center no-underline"
          >
            Back to bookings
          </Link>
        </LuxuryCheckoutPanel>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="admin"
      title="Booking detail"
      subtitle="Full guest and experience information for this reservation."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="eyebrow luxury-panel-label">Reference</div>
            <h2 className="luxury-panel-heading mt-2 font-display text-2xl uppercase leading-tight tracking-[0.05em] sm:text-3xl">
              {booking.experience.title}
            </h2>
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

        <dl className="mt-8 grid gap-5 border-t text-sm luxury-panel-divider pt-8 sm:grid-cols-2">
          <div>
            <dt className="eyebrow luxury-panel-label">Guest</dt>
            <dd className="luxury-panel-body mt-1">{booking.guestName ?? "Guest"}</dd>
            <dd className="luxury-panel-body text-xs">{booking.guestEmail}</dd>
            {booking.guestPhone ? (
              <dd className="luxury-panel-body text-xs">{booking.guestPhone}</dd>
            ) : null}
          </div>
          <div>
            <dt className="eyebrow luxury-panel-label">Host</dt>
            <dd className="luxury-panel-body mt-1">{booking.experience.hostName}</dd>
          </div>
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
              {booking.experience.address || booking.experience.city}
            </dd>
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
              Pay at venue
              {booking.paymentStatus === "paid" ? " · Paid" : " · Pending"}
            </dd>
          </div>
          <div>
            <dt className="eyebrow luxury-panel-label">Booked on</dt>
            <dd className="luxury-panel-body mt-1">{formatDateLong(booking.createdAt.slice(0, 10))}</dd>
          </div>
        </dl>

        {booking.notes ? (
          <div className="mt-6 border-t luxury-panel-divider pt-5">
            <div className="eyebrow luxury-panel-label">Guest notes</div>
            <p className="luxury-panel-body mt-2 text-sm">{booking.notes}</p>
          </div>
        ) : null}

        <div className="mt-6 border-t luxury-panel-divider pt-6">
          <PayAtVenueBadge surface="light" />
        </div>
      </LuxuryCheckoutPanel>

      <Link
        to="/admin/bookings"
        className="luxury-btn-sm dashboard-chrome-btn mt-8 inline-flex items-center no-underline"
      >
        Back to bookings
      </Link>
    </DashboardShell>
  );
}
