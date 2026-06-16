import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout route so /bookings/$bookingId/review renders via <Outlet />. */
export const Route = createFileRoute("/bookings/$bookingId")({
  component: BookingLayout,
});

function BookingLayout() {
  return <Outlet />;
}
