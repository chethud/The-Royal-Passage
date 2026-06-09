import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout route so /host/experiences/new and /$experienceId render via <Outlet /> */
export const Route = createFileRoute("/host/experiences")({
  component: HostExperiencesLayout,
});

function HostExperiencesLayout() {
  return <Outlet />;
}
