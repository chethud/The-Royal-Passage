import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookingCheckoutWizard } from "@/components/booking/BookingCheckoutWizard";
import { BookingRequestHeader } from "@/components/booking/BookingRequestHeader";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import { bookExperiencePath, parseBookSearch } from "@/lib/booking-url";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { dashboardPathForRole, isGuestAccount, isStaffRole } from "@/lib/roles";

export const Route = createFileRoute("/experiences/$slug/book")({
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
          ? `Book ${loaderData.exp.title} — The Royal Passage`
          : "Book experience — The Royal Passage",
      },
    ],
  }),
  component: BookExperiencePage,
});

function BookExperiencePage() {
  const { exp, source } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  const redirectPath = bookExperiencePath(exp.slug, {
    slotId: search.slotId,
    guests: search.guests,
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
          <p className="text-sm text-muted-foreground">Preparing your booking…</p>
        </div>
      </div>
    );
  }

  if (!isGuestAccount(role)) {
    return null;
  }

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />

      <section className="container-page max-w-6xl py-10 sm:py-14">
        <Link
          to="/experiences/$slug"
          params={{ slug: exp.slug }}
          hash="book"
          className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]/85 transition-colors hover:text-[#F7F1E8]"
        >
          ← Back to experience
        </Link>

        <BookingRequestHeader
          className="mt-6"
          label="Book your seats"
          title={exp.title}
          meta={`${exp.city} · ${exp.hostName}`}
          titleAs="h1"
        />

        <BookingCheckoutWizard
          exp={exp}
          source={source}
          initialSlotId={search.slotId}
          initialGuests={search.guests}
          backLink={{
            to: "/experiences/$slug",
            params: { slug: exp.slug },
            hash: "book",
            label: "Back to experience",
          }}
          userRole={role ?? "guest"}
          onSuccess={(bookingId) => {
            void navigate({
              to: "/dashboard/history",
              search: { booked: bookingId },
            });
          }}
        />
      </section>

      <Footer />
    </div>
  );
}
