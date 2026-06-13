import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout route so each /admin/* section renders on its own page via <Outlet />. */
export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
