import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MysoreTrailBuilder } from "@/components/mysore-trail/MysoreTrailBuilder";
import { DEFAULT_MYSORE_TRAIL } from "@/data/mysore-trail";
import { useAuthUser } from "@/lib/auth-user";
import { getMysoreTrail } from "@/lib/mysore-trail-fns";
import { canEditMysoreTrail, isGuestAccount, pickPrimaryRole } from "@/lib/roles";
import { SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";

export const Route = createFileRoute("/mysore-trail")({
  head: () => ({
    meta: [
      { title: "Mysore Trail — The Royal Passage" },
      {
        name: "description",
        content:
          "Build your Mysuru itinerary day by day — palace mornings, hill temples, host kitchens, and stays.",
      },
      { property: "og:title", content: "Mysore Trail — The Royal Passage" },
      {
        property: "og:description",
        content: "Plan a personal Mysuru trail with days, stops, and notes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/mysore-trail` },
    ],
    links: [canonicalLink("/mysore-trail", SITE_URL)],
  }),
  loader: async () => {
    const trail = await getMysoreTrail().catch(() => structuredClone(DEFAULT_MYSORE_TRAIL));
    return { trail };
  },
  component: MysoreTrailPage,
});

function MysoreTrailPage() {
  const { trail } = Route.useLoaderData();
  const { user, role, roles, loading } = useAuthUser();
  const primaryRole = pickPrimaryRole(roles, role);
  const canEdit = canEditMysoreTrail(role, roles);
  const isGuest = !user || isGuestAccount(primaryRole, roles);

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-12 sm:py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="eyebrow mb-3 text-ember/95">Mysuru</div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink text-balance sm:text-5xl md:text-6xl">
              Mysore <em className="italic text-ember">Trail</em>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
              A curated passage through the city — then shape your own days if you are planning a
              visit.
            </p>
          </div>

          {!loading && canEdit ? (
            <Link
              to="/admin/mysore-trail"
              className="inline-flex items-center rounded-sm bg-ember px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Edit trail
            </Link>
          ) : null}
        </div>

        <MysoreTrailBuilder initial={trail} mode="view" />

        {isGuest ? (
          <div className="mt-16 border-t border-ink/10 pt-12 sm:mt-20">
            <div className="max-w-2xl">
              <div className="eyebrow mb-3 text-ember/95">Your draft</div>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Build your own trail</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                Personalise days and stops for your trip. Saved only on this device.
              </p>
            </div>
            <MysoreTrailBuilder initial={trail} mode="guest" />
          </div>
        ) : null}
      </section>
      <Footer />
    </div>
  );
}
