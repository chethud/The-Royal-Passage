import { createFileRoute } from "@tanstack/react-router";
import { AdminHomepagePhotoEditor } from "@/components/admin/AdminHomepagePhotoEditor";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { normalizeHomepageContent } from "@/lib/homepage-content";

export const Route = createFileRoute("/admin/profile/homepage-photos")({
  loader: async () => {
    const homepage = await getHomepageContent().catch(() => normalizeHomepageContent({}));
    return { homepage: normalizeHomepageContent(homepage ?? {}) };
  },
  component: AdminProfileHomepagePhotosPage,
});

function AdminProfileHomepagePhotosPage() {
  const { homepage } = Route.useLoaderData();
  return <AdminHomepagePhotoEditor initialContent={homepage} />;
}
