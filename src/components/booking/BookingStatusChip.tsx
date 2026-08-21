type BookingStatusChipProps = {
  bookingStatus: string;
  paymentStatus?: string;
  isPaused?: boolean;
  surface?: "light" | "dark";
  compact?: boolean;
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
  compact = false,
  pendingPaymentLabel = "Pay at venue",
}: BookingStatusChipProps) {
  const label = isPaused && bookingStatus === "confirmed" ? "Paused" : (BOOKING_LABELS[bookingStatus] ?? bookingStatus);
  const isLight = surface === "light";

  if (isLight) {
    return (
      <span className="inline-flex max-w-[7.5rem] flex-col items-end gap-0 border-l border-[#4A0000]/70 pl-1.5 text-right sm:max-w-[8.5rem]">
        <span className="text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.08em] text-[#2A0000]">
          {label}
        </span>
        {!isPaused && bookingStatus === "confirmed" && paymentStatus === "pending" ? (
          <span className="text-[0.55rem] leading-tight text-[#2A0000]/75 normal-case tracking-normal">
            {pendingPaymentLabel}
          </span>
        ) : null}
        {isPaused ? (
          <span className="text-[0.55rem] leading-tight text-[#2A0000]/75 normal-case tracking-normal">
            On hold
          </span>
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

  const chipClass = compact
    ? `inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.08em] ${tone}`
    : `inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${tone}`;

  return (
    <span className={chipClass}>
      {label}
      {!isPaused && bookingStatus === "confirmed" && paymentStatus === "pending" ? (
        <span className={`normal-case tracking-normal opacity-80 ${compact ? "text-[0.5rem]" : "text-[0.65rem]"}`}>
          · {pendingPaymentLabel}
        </span>
      ) : null}
    </span>
  );
}
