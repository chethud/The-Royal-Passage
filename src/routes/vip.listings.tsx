import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/vip/listings")({
  component: () => <Outlet />,
});
