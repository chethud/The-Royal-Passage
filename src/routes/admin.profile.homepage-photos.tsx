import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HomepagePhotosSection } from "@/components/admin/HomepagePhotosSection";
import { useAuthUser } from "@/lib/auth-user";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { normalizeHomepageContent } from "@/lib/homepage-content";
import { fetchFeaturedHomestaySlugs } from "@/lib/homestay-featured-fns";
import { getHomestaysForUi } from "@/lib/homestay-fns";
import { getCatalogForUi, getCatalogFallback } from "@/lib/marketplace-fns";
import { toShowcaseExperienceOption } from "@/lib/showcase-from-experience";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/profile/homepage-photos")({
  loader: async () => {
    const [homepage, catalog, homestayCatalog, featuredSlugs] = await Promise.all([
      getHomepageContent().catch(() => normalizeHomepageContent({})),
      getCatalogForUi().catch(() => getCatalogFallback()),
      getHomestaysForUi().catch(() => ({ homestays: [] })),
      fetchFeaturedHomestaySlugs().catch(() => [] as string[]),
    ]);
    return {
      homepage: normalizeHomepageContent(homepage ?? {}),
      experiences: (catalog.experiences ?? []).map(toShowcaseExperienceOption),
      homestays: homestayCatalog.homestays ?? [],
      featuredSlugs,
    };
  },
  component: AdminProfileHomepagePhotosPage,
});

function AdminProfileHomepagePhotosPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthUser();
  const { homepage, experiences, homestays, featuredSlugs } = Route.useLoaderData();
  const [savedFeaturedSlugs, setSavedFeaturedSlugs] = useState(featuredSlugs);

  useEffect(() => {
    setSavedFeaturedSlugs(featuredSlugs);
  }, [featuredSlugs]);

  const refresh = useCallback(() => {
    void router.invalidate();
  }, [router]);

  if (!user || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <HomepagePhotosSection
      homepage={homepage}
      experiences={experiences}
      homestays={homestays}
      featuredSlugs={savedFeaturedSlugs}
      onFeaturedSaved={(slugs) => {
        setSavedFeaturedSlugs(slugs);
        refresh();
      }}
    />
  );
}
