import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookingRequestHeader } from "@/components/booking/BookingRequestHeader";
import { HomestayCheckoutWizard } from "@/components/homestays/HomestayCheckoutWizard";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import { bookHomestayPath, parseHomestayBookSearch } from "@/lib/homestay-booking-url";
import { getHomestayForDetail } from "@/lib/homestay-fns";
import { dashboardPathForRole, isGuestAccount, isStaffRole } from "@/lib/roles";

export const Route = createFileRoute("/homestays/$slug/book")({
  validateSearch: parseHomestayBookSearch,
  loader: async ({ params }) => {
    const row = await getHomestayForDetail({ data: { slug: params.slug } });
    if (!row) throw new Error("Homestay not found.");
    return row;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.homestay
          ? `Book ${loaderData.homestay.title} — The Royal Passage`
          : "Book homestay — The Royal Passage",
      },
    ],
  }),
  component: BookHomestayPage,
});

function BookHomestayPage() {
  const { homestay: stay, source } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  const redirectPath = bookHomestayPath(stay.slug, {
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    guests: search.guests,
    roomId: search.roomId,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: redirectPath } });
      return;
    }
    if (isStaffRole(role)) {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, redirectPath, role, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] text-foreground">
        <Header />
        <div className="container-page py-16">
          <p className="text-sm text-muted-foreground">Preparing your stay request…</p>
        </div>
      </div>
    );
  }

  if (!isGuestAccount(role)) return null;

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/homestays/$slug"
            params={{ slug: stay.slug }}
            hash="book"
            className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold/85 transition-colors hover:text-ink"
          >
            ← Back to homestay
          </Link>

          <BookingRequestHeader
            className="mt-6"
            label="Book your stay"
            title={stay.title}
            meta={`${stay.city} · ${stay.propertyType}`}
            titleAs="h1"
          />

          <HomestayCheckoutWizard
            stay={stay}
            source={source}
            initialCheckIn={search.checkIn}
            initialCheckOut={search.checkOut}
            initialGuests={search.guests}
            backLink={{
              to: "/homestays/$slug",
              params: { slug: stay.slug },
              label: "Back to homestay",
            }}
            onSuccess={(bookingId) => {
              void navigate({
                to: "/stays/$bookingId",
                params: { bookingId },
                search: { confirmed: true },
              });
            }}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
