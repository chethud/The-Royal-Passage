import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/past")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/history" });
  },
});
