import { createFileRoute } from "@tanstack/react-router";

import { Crown } from "lucide-react";

import { useMemo } from "react";

import { Header } from "@/components/site/Header";

import { Footer } from "@/components/site/Footer";

import { VipCard } from "@/components/vips/VipCard";

import { VipsBrowseHero } from "@/components/vips/VipsBrowseHero";

import { VipsCustomPackageCta } from "@/components/vips/VipsCustomPackageCta";

import { vipSearchFromBrowse } from "@/components/vips/VipsSearchWidget";

import { VipsPackageTypeFilter } from "@/components/vips/VipsPackageTypeFilter";

import { getVipsForUi } from "@/lib/vip-fns";

import {
  filterVips,
  hasVipBrowseCriteria,
  normalizeVipTravelDates,
  parseVipBrowseSearch,
  vipBrowseBlockReason,
  VIP_BOOKING_POLICY_LINE,
  type VipBrowseSearch,
} from "@/lib/vip-filters";

import { canonicalLink } from "@/lib/seo-helpers";

import { SITE_URL } from "@/lib/seo";



export const Route = createFileRoute("/vips/browse/")({

  loader: async () => getVipsForUi(),

  validateSearch: parseVipBrowseSearch,

  head: () => ({

    meta: [

      { title: "Browse Royal VIP Packages — The Royal Passage" },

      {

        name: "description",

        content:

          "Search curated Royal VIP packages in Mysuru. Book at least 4 days ahead — palace experiences, heritage circuits, and wellness retreats.",

      },

      { property: "og:url", content: `${SITE_URL}/vips/browse` },

    ],

    links: [canonicalLink("/vips/browse", SITE_URL)],

  }),

  component: VipsBrowsePage,

});



function VipsBrowsePage() {

  const { vips } = Route.useLoaderData();

  const search = Route.useSearch();

  const navigate = Route.useNavigate();

  const browseBlock = vipBrowseBlockReason(search);
  const criteriaReady = hasVipBrowseCriteria(search);



  const filtered = useMemo(

    () => (criteriaReady ? filterVips(vips, search) : []),

    [criteriaReady, search, vips],

  );



  const updateSearch = (patch: Partial<VipBrowseSearch>) => {

    void navigate({

      search: (prev) => {

        const next = { ...prev, ...patch };

        if (next.checkIn && next.checkOut && next.checkOut <= next.checkIn) {

          const checkout = new Date(`${next.checkIn}T12:00:00`);

          checkout.setDate(checkout.getDate() + 1);

          next.checkOut = checkout.toISOString().slice(0, 10);

        }

        return next;

      },

    });

  };



  const applySearch = () => {
    const values = vipSearchFromBrowse(search);
    const dates = normalizeVipTravelDates(values.checkIn, values.checkOut);
    void navigate({
      search: {
        q: values.q?.trim() || undefined,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        guests: values.guests,
        packageType: search.packageType,
      },
    });
  };



  return (

    <div className="min-h-screen bg-background text-foreground">

      <Header />

      <VipsBrowseHero

        search={search}

        onSearchChange={(patch) => updateSearch(patch)}

        onSubmit={applySearch}

      />



      <section className="container-page py-10 sm:py-12">

        {!criteriaReady ? (
          <div className="luxury-empty">
            <Crown className="mb-4 h-8 w-8 text-[#D4AF6A]/80" strokeWidth={1.5} aria-hidden />
            <h2 className="font-display text-xl text-ink">
              {browseBlock === "too_soon" ? "Book a little earlier" : "Tell us about your trip"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {browseBlock === "too_soon"
                ? VIP_BOOKING_POLICY_LINE
                : `Enter travel dates and guest count above, then tap Search to see matching packages. ${VIP_BOOKING_POLICY_LINE}`}
            </p>
          </div>
        ) : (

          <>

            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

              <div>

                <p className="eyebrow text-ember/90">Available packages</p>

                <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">

                  {filtered.length} package{filtered.length === 1 ? "" : "s"}

                </h2>

                <p className="mt-2 text-sm text-muted-foreground">

                  {search.checkIn} → {search.checkOut}

                  {search.guests

                    ? ` · ${search.guests} guest${search.guests === 1 ? "" : "s"}`

                    : ""}

                </p>

              </div>

              <div className="w-full sm:min-w-[240px] sm:w-auto">

                <span className="eyebrow mb-2 block text-[0.58rem]">Package type</span>

                <VipsPackageTypeFilter

                  value={search.packageType}

                  onChange={(packageType) => updateSearch({ packageType })}

                />

              </div>

            </div>



            {filtered.length === 0 ? (

              <div className="luxury-empty">

                <Crown className="mb-4 h-8 w-8 text-[#D4AF6A]/80" strokeWidth={1.5} aria-hidden />

                <h2 className="font-display text-xl text-ink">No packages match your search</h2>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">

                  Try different dates, fewer guests, or another package type — or request a custom

                  package below.

                </p>

                <button

                  type="button"

                  onClick={() =>

                    updateSearch({

                      q: undefined,

                      checkIn: undefined,

                      checkOut: undefined,

                      guests: undefined,

                      packageType: undefined,

                    })

                  }

                  className="luxury-btn-sm luxury-btn-primary mt-6"

                >

                  Clear search

                </button>

              </div>

            ) : (

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {filtered.map((pkg) => (

                  <VipCard key={pkg.id} pkg={pkg} search={search} />

                ))}

              </div>

            )}

          </>

        )}



        <VipsCustomPackageCta className="mt-12" />

      </section>

      <Footer />

    </div>

  );

}


