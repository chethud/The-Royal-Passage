import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout route so /host/bookings/$bookingId renders via <Outlet /> */
export const Route = createFileRoute("/host/bookings")({
  component: HostBookingsLayout,
});

function HostBookingsLayout() {
  return <Outlet />;
}
