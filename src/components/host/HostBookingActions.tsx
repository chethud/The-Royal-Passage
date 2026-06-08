import type { BookingSummary } from "@/lib/api/bookings";

type HostBookingActionsProps = {
  booking: BookingSummary;
  busy: boolean;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onComplete: (id: string) => void;
  layout?: "inline" | "stack";
};

export function HostBookingActions({
  booking,
  busy,
  onConfirm,
  onReject,
  onMarkPaid,
  onComplete,
  layout = "inline",
}: HostBookingActionsProps) {
  const btn =
    "rounded-sm border px-2 py-1 text-xs disabled:opacity-50 hover:border-ember/50";
  const wrap = layout === "stack" ? "flex flex-col gap-2 sm:flex-row sm:flex-wrap" : "flex flex-wrap gap-2";

  if (booking.bookingStatus === "pending") {
    return (
      <div className={wrap}>
        <button type="button" disabled={busy} className={btn} onClick={() => onConfirm(booking.id)}>
          Accept
        </button>
        <button
          type="button"
          disabled={busy}
          className={`${btn} border-destructive/40 text-destructive`}
          onClick={() => onReject(booking.id)}
        >
          Reject
        </button>
      </div>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") {
    return (
      <button type="button" disabled={busy} className={btn} onClick={() => onMarkPaid(booking.id)}>
        Mark paid
      </button>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") {
    return (
      <button type="button" disabled={busy} className={btn} onClick={() => onComplete(booking.id)}>
        Complete
      </button>
    );
  }

  return <span className="text-xs text-muted-foreground">—</span>;
}
