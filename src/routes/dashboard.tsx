import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout route so /dashboard/wishlist, /history, /profile render via <Outlet /> */
export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return <Outlet />;
}
