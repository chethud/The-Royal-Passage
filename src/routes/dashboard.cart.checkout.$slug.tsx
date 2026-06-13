import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { BookingCheckoutWizard } from "@/components/booking/BookingCheckoutWizard";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import { parseBookSearch } from "@/lib/booking-url";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard/cart/checkout/$slug")({
  validateSearch: parseBookSearch,
  loader: async ({ params }) => {
    const row = await getExperienceForDetail({ data: { slug: params.slug } });
    if (!row) throw new Error("Experience not found.");
    return row;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.exp
          ? `Checkout — ${loaderData.exp.title} — The Royal Passage`
          : "Checkout — The Royal Passage",
      },
    ],
  }),
  component: CartCheckoutPage,
});

function CartCheckoutPage() {
  const { exp, source } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { role, ready, loading } = useGuestAccess();
  const { items: cartItems } = useExperienceCart();

  const cartItem = useMemo(
    () => cartItems.find((item) => item.slug === exp.slug || item.experienceId === exp.id),
    [cartItems, exp.id, exp.slug],
  );

  useEffect(() => {
    if (!ready) return;
    if (!cartItem) {
      void navigate({ to: "/dashboard/cart" });
    }
  }, [cartItem, navigate, ready]);

  if (loading || !ready || !cartItem) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <GuestDashboardShell
      title="Checkout"
      subtitle="Choose your date, payment method, and send a booking request to your host."
    >
      <Link to="/dashboard/cart" className="text-xs eyebrow text-muted-foreground hover:text-foreground">
        ← Back to cart
      </Link>

      <div className="mt-4">
        <div className="eyebrow mb-2 text-ember/90">Booking request</div>
        <h2 className="font-display text-3xl">{exp.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {exp.city} · {exp.hostName}
        </p>
      </div>

      <BookingCheckoutWizard
        exp={exp}
        source={source}
        initialSlotId={search.slotId ?? cartItem.slotId}
        initialGuests={search.guests ?? cartItem.guests}
        backLink={{ to: "/dashboard/cart", label: "Back to cart" }}
        userRole={role}
        onSuccess={(bookingId) => {
          void navigate({
            to: "/dashboard/history",
            search: { booked: bookingId },
          });
        }}
      />
    </GuestDashboardShell>
  );
}
