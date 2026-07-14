import { createFileRoute } from "@tanstack/react-router";
import { AdminHomepagePhotoEditor } from "@/components/admin/AdminHomepagePhotoEditor";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { normalizeHomepageContent } from "@/lib/homepage-content";
import { getCatalogForUi, getCatalogFallback } from "@/lib/marketplace-fns";
import { toShowcaseExperienceOption } from "@/lib/showcase-from-experience";

export const Route = createFileRoute("/admin/profile/homepage-photos")({
  loader: async () => {
    const [homepage, catalog] = await Promise.all([
      getHomepageContent().catch(() => normalizeHomepageContent({})),
      getCatalogForUi().catch(() => getCatalogFallback()),
    ]);
    return {
      homepage: normalizeHomepageContent(homepage ?? {}),
      experiences: (catalog.experiences ?? []).map(toShowcaseExperienceOption),
    };
  },
  component: AdminProfileHomepagePhotosPage,
});

function AdminProfileHomepagePhotosPage() {
  const { homepage, experiences } = Route.useLoaderData();
  return <AdminHomepagePhotoEditor initialContent={homepage} experiences={experiences} />;
}
