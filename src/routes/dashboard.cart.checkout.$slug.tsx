import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookingCheckoutWizard } from "@/components/booking/BookingCheckoutWizard";
import { BookingRequestHeader } from "@/components/booking/BookingRequestHeader";
import { ExperienceDetailGallery } from "@/components/experiences/ExperienceDetailGallery";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import { parseBookSearch } from "@/lib/booking-url";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { useGuestAccess } from "@/lib/use-guest-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

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
    () =>
      cartItems.find(
        (item) =>
          item.kind === "experience" &&
          (item.slug === exp.slug || item.experienceId === exp.id),
      ),
    [cartItems, exp.id, exp.slug],
  );

  useEffect(() => {
    if (!ready || !cartHydrated) return;
    if (!cartItem) {
      void navigate({ to: "/dashboard/cart" });
    }
  }, [cartHydrated, cartItem, navigate, ready]);

  if (loading || !ready || !cartHydrated) {
    return <PageLoadingGate />;
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

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="w-full lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <ExperienceDetailGallery exp={exp} />
        </div>

        <div className="min-w-0">
          <BookingRequestHeader
            label="Booking request"
            title={exp.title}
            meta={`${exp.city} · ${exp.hostName}`}
            titleAs="h2"
          />

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
        </div>
      </div>
    </GuestDashboardShell>
  );
}
