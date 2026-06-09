import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout route so /experiences/$slug/book can render via <Outlet /> */
export const Route = createFileRoute("/experiences/$slug")({
  component: ExperienceSlugLayout,
});

function ExperienceSlugLayout() {
  return <Outlet />;
}
