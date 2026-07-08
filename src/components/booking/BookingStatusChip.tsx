type BookingStatusChipProps = {
  bookingStatus: string;
  paymentStatus?: string;
  isPaused?: boolean;
  surface?: "light" | "dark";
  /** Shown when confirmed and payment pending (default: Pay at venue). */
  pendingPaymentLabel?: string;
};

const BOOKING_LABELS: Record<string, string> = {
  pending: "Awaiting host",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function BookingStatusChip({
  bookingStatus,
  paymentStatus,
  isPaused = false,
  surface = "dark",
  pendingPaymentLabel = "Pay at venue",
}: BookingStatusChipProps) {
  const label = isPaused && bookingStatus === "confirmed" ? "Paused" : (BOOKING_LABELS[bookingStatus] ?? bookingStatus);
  const isLight = surface === "light";

  if (isLight) {
    return (
      <span className="inline-flex max-w-[9.5rem] flex-col items-end gap-0.5 border-l-[2px] border-[#4A0000] pl-1.5 text-right sm:max-w-[12rem] sm:border-l-[3px] sm:pl-2.5">
        <span className="eyebrow luxury-panel-label text-[0.55rem] leading-snug sm:text-[0.62rem]">{label}</span>
        {!isPaused && bookingStatus === "confirmed" && paymentStatus === "pending" ? (
          <span className="luxury-panel-body text-[0.62rem] normal-case tracking-normal">{pendingPaymentLabel}</span>
        ) : null}
        {isPaused ? (
          <span className="luxury-panel-body text-[0.62rem] normal-case tracking-normal">On hold</span>
        ) : null}
      </span>
    );
  }

  const tone =
    isPaused && bookingStatus === "confirmed"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
      : bookingStatus === "confirmed"
        ? "border-ember/50 bg-ember/10 text-ember"
        : bookingStatus === "completed"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : bookingStatus === "cancelled"
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : "border-[oklch(0.88_0.08_86_/_0.35)] bg-background/30 text-foreground/80";

  return (
    <span className={`inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${tone}`}>
      {label}
      {!isPaused && bookingStatus === "confirmed" && paymentStatus === "pending" ? (
        <span className="normal-case tracking-normal text-[0.65rem] opacity-80">· {pendingPaymentLabel}</span>
      ) : null}
    </span>
  );
}
