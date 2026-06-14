import type { BookingSummary } from "@/lib/api/bookings";

type HostBookingActionsProps = {
  booking: BookingSummary;
  busy: boolean;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onComplete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  layout?: "inline" | "stack";
  surface?: "light" | "dark";
};

export function HostBookingActions({
  booking,
  busy,
  onConfirm,
  onReject,
  onMarkPaid,
  onComplete,
  onPause,
  onResume,
  layout = "inline",
  surface = "light",
}: HostBookingActionsProps) {
  const isLight = surface === "light";
  const wrap = layout === "stack" ? "flex flex-col gap-2 sm:flex-row sm:flex-wrap" : "flex flex-wrap gap-2";
  const primaryBtn = isLight
    ? "luxury-btn-sm luxury-btn-primary disabled:opacity-50"
    : "rounded-sm border px-2 py-1 text-xs disabled:opacity-50 hover:border-ember/50";
  const outlineBtn = isLight
    ? "luxury-btn-sm luxury-btn-panel-outline disabled:opacity-50"
    : "rounded-sm border px-2 py-1 text-xs disabled:opacity-50 hover:border-ember/50";
  const dangerBtn = isLight
    ? "luxury-btn-sm luxury-btn-panel-danger disabled:opacity-50"
    : "rounded-sm border border-destructive/40 px-2 py-1 text-xs text-destructive disabled:opacity-50";

  if (booking.bookingStatus === "pending") {
    return (
      <div className={wrap}>
        <button type="button" disabled={busy} className={primaryBtn} onClick={() => onConfirm(booking.id)}>
          Accept
        </button>
        <button type="button" disabled={busy} className={dangerBtn} onClick={() => onReject(booking.id)}>
          Reject
        </button>
      </div>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.isPaused) {
    return (
      <button type="button" disabled={busy} className={primaryBtn} onClick={() => onResume(booking.id)}>
        Resume
      </button>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") {
    return (
      <div className={wrap}>
        <button type="button" disabled={busy} className={outlineBtn} onClick={() => onPause(booking.id)}>
          Pause
        </button>
        <button type="button" disabled={busy} className={primaryBtn} onClick={() => onMarkPaid(booking.id)}>
          Mark paid
        </button>
      </div>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") {
    return (
      <div className={wrap}>
        <button type="button" disabled={busy} className={outlineBtn} onClick={() => onPause(booking.id)}>
          Pause
        </button>
        <button type="button" disabled={busy} className={primaryBtn} onClick={() => onComplete(booking.id)}>
          Complete
        </button>
      </div>
    );
  }

  return <span className={`text-xs ${isLight ? "luxury-panel-body" : "text-muted-foreground"}`}>—</span>;
}
