import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { fetchHomepageContent } from "@/lib/homepage-content-fns";
import type { HomepageContent } from "@/lib/homepage-content";
import { commitHomepagePhotoForEditor } from "@/lib/homepage-photo-upload";
import { buildHomeJsonLd, SITE_URL } from "@/lib/seo";
import { isEditorRole } from "@/lib/roles";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [catalog, homepage] = await Promise.all([getCatalogForUi(), fetchHomepageContent()]);
    return { ...catalog, homepage };
  },
  staleTime: 0,
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
  const router = useRouter();
  const { experiences, homepage } = Route.useLoaderData();
  const { role, accessToken } = useAuthUser();
  const isEditor = isEditorRole(role);
  const ldJson = buildHomeJsonLd(experiences);

  const [draft, setDraft] = useState<HomepageContent>(homepage);
  const [savedSnapshot, setSavedSnapshot] = useState<HomepageContent>(homepage);
  const skipHomepageSyncRef = useRef(false);

  useEffect(() => {
    if (skipHomepageSyncRef.current) {
      skipHomepageSyncRef.current = false;
      return;
    }
    setDraft(homepage);
    setSavedSnapshot(homepage);
  }, [homepage]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(savedSnapshot),
    [draft, savedSnapshot],
  );

  const publicContent = homepage;
  const editorContent = draft;
  const displayVersion = isEditor ? editorContent.version : publicContent.version;

  const commitHomepage = useCallback((next: HomepageContent) => {
    skipHomepageSyncRef.current = true;
    setDraft(next);
    setSavedSnapshot(next);
  }, []);

  const refreshHomepage = useCallback(() => {
    void router.invalidate().catch(() => {
      // Ignore cache refresh failures — local editor state is already updated.
    });
  }, [router]);

  const createPhotoUploader = useCallback(
    (section: "showcase" | "journal", itemIndex: number) => async (file: File) => {
      if (!accessToken) throw new Error("Sign in as editor to upload photos.");

      const result = await commitHomepagePhotoForEditor(accessToken, file, section, itemIndex);

      skipHomepageSyncRef.current = true;
      setDraft((prev) => {
        if (section === "showcase") {
          const showcase = prev.showcase.map((item, index) =>
            index === itemIndex ? { ...item, imageUrl: result.publicUrl } : item,
          );
          return { ...prev, showcase, version: result.version };
        }
        const journal = prev.journal.map((item, index) =>
          index === itemIndex ? { ...item, imageUrl: result.publicUrl } : item,
        );
        return { ...prev, journal, version: result.version };
      });
      setSavedSnapshot((prev) => {
        if (section === "showcase") {
          const showcase = prev.showcase.map((item, index) =>
            index === itemIndex ? { ...item, imageUrl: result.publicUrl } : item,
          );
          return { ...prev, showcase, version: result.version };
        }
        const journal = prev.journal.map((item, index) =>
          index === itemIndex ? { ...item, imageUrl: result.publicUrl } : item,
        );
        return { ...prev, journal, version: result.version };
      });

      refreshHomepage();
      return result.publicUrl;
    },
    [accessToken, refreshHomepage],
  );

  const handleSaved = useCallback(
    async (content: HomepageContent) => {
      commitHomepage(content);
      refreshHomepage();
    },
    [commitHomepage, refreshHomepage],
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
          onSaved={handleSaved}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <HomeHero />

      <ExperiencesShowcase
        items={isEditor ? editorContent.showcase : publicContent.showcase}
        imageVersion={displayVersion}
        editable={isEditor}
        onItemsChange={(showcase) => setDraft((prev) => ({ ...prev, showcase }))}
        uploadPhoto={isEditor ? createPhotoUploader : undefined}
      />

      <JourneysSplit />

      <PillarsRow />

      <JournalPreview
        items={isEditor ? editorContent.journal : publicContent.journal}
        imageVersion={displayVersion}
        editable={isEditor}
        onItemsChange={(journal) => setDraft((prev) => ({ ...prev, journal }))}
        uploadPhoto={isEditor ? createPhotoUploader : undefined}
      />

      <Footer />
    </div>
  );
}
