import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/host/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/account/profile" });
  },
});
