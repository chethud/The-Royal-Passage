import { HomestayBookingCard } from "@/components/booking/HomestayBookingCard";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import type { BookingCardSurface } from "@/components/booking/BookingCardPrimitives";

type GuestHomestayBookingsListProps = {
  bookings: HomestayBookingSummary[];
  surface?: BookingCardSurface;
};

export function GuestHomestayBookingsList({
  bookings,
  surface = "light",
}: GuestHomestayBookingsListProps) {
  if (bookings.length === 0) return null;

  const isLight = surface === "light";

  return (
    <ul className={isLight ? "divide-y divide-[rgb(74_0_0/0.15)]" : "space-y-4"}>
      {bookings.map((booking) => (
        <li key={booking.id}>
          <HomestayBookingCard booking={booking} surface={surface} />
        </li>
      ))}
    </ul>
  );
}
