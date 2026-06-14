type BookingStatusChipProps = {
  bookingStatus: string;
  paymentStatus?: string;
  surface?: "light" | "dark";
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
  surface = "dark",
}: BookingStatusChipProps) {
  const label = BOOKING_LABELS[bookingStatus] ?? bookingStatus;
  const isLight = surface === "light";

  if (isLight) {
    return (
      <span className="inline-flex max-w-[12rem] flex-col items-end gap-0.5 border-l-[3px] border-[#4A0000] pl-2.5 text-right">
        <span className="eyebrow luxury-panel-label text-[0.62rem] leading-snug">{label}</span>
        {bookingStatus === "confirmed" && paymentStatus === "pending" ? (
          <span className="luxury-panel-body text-[0.62rem] normal-case tracking-normal">Pay at venue</span>
        ) : null}
      </span>
    );
  }

  const tone =
    bookingStatus === "confirmed"
      ? "border-ember/50 bg-ember/10 text-ember"
      : bookingStatus === "completed"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
        : bookingStatus === "cancelled"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-[oklch(0.88_0.08_86_/_0.35)] bg-background/30 text-foreground/80";

  return (
    <span className={`inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${tone}`}>
      {label}
      {bookingStatus === "confirmed" && paymentStatus === "pending" ? (
        <span className="normal-case tracking-normal text-[0.65rem] opacity-80">· Pay at venue</span>
      ) : null}
    </span>
  );
}
