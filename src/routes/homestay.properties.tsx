import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/homestay/properties")({
  component: () => <Outlet />,
});
