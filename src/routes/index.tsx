import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HomeHero } from "@/components/site/HomeHero";
import { ExperiencesShowcase } from "@/components/site/ExperiencesShowcase";
import { JourneysSplit } from "@/components/site/JourneysSplit";
import { PillarsRow } from "@/components/site/PillarsRow";
import { JournalPreview } from "@/components/site/JournalPreview";
import { HomepageEditorBar } from "@/components/editor/HomepageEditorBar";
import { useAuthUser } from "@/lib/auth-user";
import { getCatalogForUi } from "@/lib/marketplace-fns";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import type { HomepageContent } from "@/lib/homepage-content";
import { buildHomeJsonLd, SITE_URL } from "@/lib/seo";
import { isEditorRole } from "@/lib/roles";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [catalog, homepage] = await Promise.all([getCatalogForUi(), getHomepageContent()]);
    return { ...catalog, homepage };
  },
  head: () => ({
    meta: [
      { title: "The Royal Passage — Experience Mysuru, Royally" },
      {
        name: "description",
        content:
          "Curated experiences in Mysuru — heritage walks, culinary journeys, pottery, nature trails and bespoke royal expeditions hosted by trusted local experts.",
      },
      { property: "og:title", content: "The Royal Passage" },
      {
        property: "og:description",
        content: "Experience Mysuru, Royally — curated, immersive, unforgettable.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  const { experiences, homepage } = Route.useLoaderData();
  const { role, accessToken } = useAuthUser();
  const isEditor = isEditorRole(role);
  const ldJson = buildHomeJsonLd(experiences);

  const [draft, setDraft] = useState<HomepageContent>(homepage);
  const [savedSnapshot, setSavedSnapshot] = useState<HomepageContent>(homepage);

  useEffect(() => {
    setDraft(homepage);
    setSavedSnapshot(homepage);
  }, [homepage]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(savedSnapshot),
    [draft, savedSnapshot],
  );

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Header />
      {isEditor && accessToken ? (
        <HomepageEditorBar
          accessToken={accessToken}
          showcase={draft.showcase}
          journal={draft.journal}
          dirty={dirty}
          onSaved={() => setSavedSnapshot(draft)}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <HomeHero />

      <ExperiencesShowcase
        items={isEditor ? draft.showcase : homepage.showcase}
        editable={isEditor}
        onItemsChange={(showcase) => setDraft((prev) => ({ ...prev, showcase }))}
      />

      <JourneysSplit />

      <PillarsRow />

      <JournalPreview
        items={isEditor ? draft.journal : homepage.journal}
        editable={isEditor}
        onItemsChange={(journal) => setDraft((prev) => ({ ...prev, journal }))}
      />

      <Footer />
    </div>
  );
}
