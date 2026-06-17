import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import { formatMoney } from "@/lib/money";

type HomestayCashPaymentNoticeProps = {
  booking: Pick<
    HomestayBookingSummary,
    "bookingStatus" | "paymentStatus" | "paymentMethod" | "totalAmount" | "currencySymbol"
  >;
  surface?: "light" | "dark";
};

export function HomestayCashPaymentNotice({ booking, surface = "light" }: HomestayCashPaymentNoticeProps) {
  const sym = booking.currencySymbol || "₹";
  const isLight = surface === "light";

  if (booking.bookingStatus === "cancelled" || booking.bookingStatus === "completed") {
    if (booking.paymentStatus === "paid") {
      return (
        <p className={`text-sm ${isLight ? "luxury-panel-body" : "text-muted-foreground"}`}>
          Cash payment received for this stay.
        </p>
      );
    }
    return null;
  }

  if (booking.bookingStatus === "pending") {
    return (
      <p className={`text-sm ${isLight ? "luxury-panel-body" : "text-muted-foreground"}`}>
        After the host confirms, pay{" "}
        <span className="font-medium">{formatMoney(booking.totalAmount, sym)}</span> in cash at check-in.
      </p>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.paymentStatus !== "paid") {
    return (
      <div className={`rounded-sm border px-4 py-3 text-sm ${isLight ? "border-[rgb(88_16_0/0.2)] bg-[rgb(255_255_255/0.45)] luxury-panel-body" : "border-border bg-muted/30 text-muted-foreground"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <BookingStatusChip
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
            pendingPaymentLabel="Pay in cash"
            surface={surface}
          />
        </div>
        <p className="mt-2 leading-relaxed">
          Pay <span className="font-display text-lg text-brand-maroon-deep">{formatMoney(booking.totalAmount, sym)}</span> in
          cash when you arrive. No card or online payment required.
        </p>
      </div>
    );
  }

  return null;
}
