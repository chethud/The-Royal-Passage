import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookingCheckoutWizard } from "@/components/booking/BookingCheckoutWizard";
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

      <section className="container-page py-10 sm:py-14">
        <Link
          to="/experiences/$slug"
          params={{ slug: exp.slug }}
          hash="book"
          className="text-xs eyebrow text-muted-foreground hover:text-foreground"
        >
          ← Back to experience
        </Link>

        <div className="mt-4">
          <div className="eyebrow mb-2 text-ember/90">Book your seats</div>
          <h1 className="font-display text-3xl sm:text-4xl">{exp.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {exp.city} · {exp.hostName}
          </p>
        </div>

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
