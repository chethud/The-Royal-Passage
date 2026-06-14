import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout route so /experiences/$slug detail pages render via <Outlet />. */
export const Route = createFileRoute("/experiences")({
  component: ExperiencesLayout,
});

function ExperiencesLayout() {
  return <Outlet />;
}
