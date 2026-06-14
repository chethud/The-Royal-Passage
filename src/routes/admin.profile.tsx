import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/account/profile" });
  },
});
