import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
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
      <DashboardShell role="admin" title="Booking" subtitle="Booking details across the platform.">
        <p className="text-destructive">{pageError ?? "Booking not found."}</p>
        <Link to="/admin/bookings" className="mt-4 inline-block text-ember hover:underline">
          Back to bookings
        </Link>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="admin"
      title="Booking detail"
      subtitle="Full guest and experience information for this reservation."
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow mb-2 text-muted-foreground">Reference</div>
            <h2 className="font-display text-3xl">{booking.experience.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ref: {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <BookingStatusChip
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
          />
        </div>

        <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8">
          <dl className="grid gap-5 sm:grid-cols-2 text-sm">
            <div>
              <dt className="eyebrow text-muted-foreground">Guest</dt>
              <dd className="mt-1">{booking.guestName ?? "Guest"}</dd>
              <dd className="text-xs text-muted-foreground">{booking.guestEmail}</dd>
              {booking.guestPhone ? (
                <dd className="text-xs text-muted-foreground">{booking.guestPhone}</dd>
              ) : null}
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Host</dt>
              <dd className="mt-1">{booking.experience.hostName}</dd>
            </div>
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
                Pay at venue
                {booking.paymentStatus === "paid" ? " · Paid" : " · Pending"}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Booked on</dt>
              <dd className="mt-1">{formatDateLong(booking.createdAt.slice(0, 10))}</dd>
            </div>
          </dl>

          {booking.notes ? (
            <div className="mt-6 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-5">
              <div className="eyebrow text-muted-foreground">Guest notes</div>
              <p className="mt-2 text-sm">{booking.notes}</p>
            </div>
          ) : null}

          <div className="mt-6">
            <PayAtVenueBadge />
          </div>
        </div>

        <Link
          to="/admin/bookings"
          className="inline-block rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-2 text-sm hover:border-ember/50"
        >
          Back to bookings
        </Link>
      </div>
    </DashboardShell>
  );
}
