import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookingCheckoutWizard } from "@/components/booking/BookingCheckoutWizard";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import { parseBookSearch } from "@/lib/booking-url";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard/cart/checkout/$slug")({
  validateSearch: parseBookSearch,
  loader: async ({ params }) => {
    const row = await getExperienceForDetail({ data: { slug: params.slug } });
    if (!row) throw notFound();
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
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    setCartHydrated(true);
  }, []);

  const cartItem = useMemo(
    () => cartItems.find((item) => item.slug === exp.slug || item.experienceId === exp.id),
    [cartItems, exp.id, exp.slug],
  );

  useEffect(() => {
    if (!ready || !cartHydrated) return;
    if (!cartItem) {
      void navigate({ to: "/dashboard/cart" });
    }
  }, [cartHydrated, cartItem, navigate, ready]);

  if (loading || !ready || !cartHydrated) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  if (!cartItem) {
    return (
      <GuestDashboardShell wide title="Checkout" subtitle="Returning to your cart…" showRoleDescription={false}>
        <p className="text-sm text-muted-foreground">This experience is no longer in your cart.</p>
      </GuestDashboardShell>
    );
  }

  return (
    <GuestDashboardShell
      wide
      title="Checkout"
      subtitle="Choose your date, payment method, and send a booking request to your host."
      showRoleDescription={false}
    >
      <Link
        to="/dashboard/cart"
        className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]/85 transition-colors hover:text-[#F7F1E8]"
      >
        ← Back to cart
      </Link>

      <LuxuryCheckoutPanel className="mt-6">
        <div className="eyebrow text-[#D4AF6A]/90">Booking request</div>
        <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.04em] text-[#F7F1E8] sm:text-3xl">
          {exp.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground/90">
          {exp.city} · {exp.hostName}
        </p>
      </LuxuryCheckoutPanel>

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
