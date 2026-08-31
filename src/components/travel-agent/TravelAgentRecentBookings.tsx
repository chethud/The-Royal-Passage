import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { TravelAgentBookingSummary } from "@/lib/api/travel-agent-bookings";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { formatTime12h } from "@/lib/weekday-slots";

type TravelAgentRecentBookingsProps = {
  bookings: TravelAgentBookingSummary[];
};

function bookingWhen(row: TravelAgentBookingSummary): string {
  if (row.kind === "homestay" && row.checkIn) {
    const out = row.checkOut ? ` → ${formatDateLong(row.checkOut)}` : "";
    return `${formatDateLong(row.checkIn)}${out}`;
  }
  if (row.slotDate) {
    const time =
      row.slotStart && row.slotEnd
        ? ` · ${formatTime12h(row.slotStart)} – ${formatTime12h(row.slotEnd)}`
        : "";
    return `${formatDateLong(row.slotDate)}${time}`;
  }
  return "—";
}

export function TravelAgentRecentBookings({ bookings }: TravelAgentRecentBookingsProps) {
  if (bookings.length === 0) {
    return <p className="host-overview-action__empty">No client bookings yet.</p>;
  }

  return (
    <ul className="divide-y divide-[rgb(74_0_0/0.12)]">
      {bookings.map((row) => (
        <li
          key={`${row.kind}-${row.id}`}
          className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
        >
          <div>
            <p className="host-overview-action__title !text-[1.05rem] !tracking-[0.06em]">
              {row.title}
            </p>
            <div className="host-overview-action__subtitle !mt-1 !normal-case !tracking-normal">
              {row.clientName ?? "Client"} · {bookingWhen(row)} ·{" "}
              {formatMoney(row.totalAmount, row.currencySymbol)}
            </div>
          </div>
          <BookingStatusChip
            status={row.bookingStatus}
            paymentStatus={row.paymentStatus}
            surface="light"
          />
        </li>
      ))}
    </ul>
  );
}
