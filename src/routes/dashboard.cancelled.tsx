import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/cancelled")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/history" });
  },
});
