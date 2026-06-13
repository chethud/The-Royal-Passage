import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/wishlist")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/cart" });
  },
  component: () => null,
});
