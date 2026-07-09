import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import type { BookingCardSurface } from "@/components/booking/BookingCardPrimitives";
import { cn } from "@/lib/utils";

type HomestayRejectionNoticeProps = {
  booking: Pick<HomestayBookingSummary, "bookingStatus" | "rejectionReason">;
  surface?: BookingCardSurface;
  className?: string;
};

export function HomestayRejectionNotice({
  booking,
  surface = "light",
  className,
}: HomestayRejectionNoticeProps) {
  if (booking.bookingStatus !== "cancelled" || !booking.rejectionReason?.trim()) {
    return null;
  }

  const isLight = surface === "light";

  return (
    <p
      className={cn(
        "rounded-sm border px-3 py-2 text-sm leading-relaxed",
        isLight
          ? "border-destructive/30 bg-destructive/5 text-[#5C2E12]"
          : "border-destructive/40 bg-destructive/10 text-muted-foreground",
        className,
      )}
    >
      <span className="font-semibold">Host declined this stay: </span>
      {booking.rejectionReason.trim()}
    </p>
  );
}
