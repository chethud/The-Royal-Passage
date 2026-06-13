import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout route so /dashboard/cart/checkout/$slug renders via <Outlet />. */
export const Route = createFileRoute("/dashboard/cart")({
  component: CartLayout,
});

function CartLayout() {
  return <Outlet />;
}
