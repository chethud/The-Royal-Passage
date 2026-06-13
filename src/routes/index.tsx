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
import type { HomepagePhotoSection } from "@/lib/homepage-content-keys";
import { commitHomepagePhotoForEditor } from "@/lib/homepage-photo-upload";
import { buildHomeJsonLd, SITE_URL } from "@/lib/seo";
import {
  canEditHomepageAdminSections,
  canEditHomepageJournal,
  isAdminRole,
  isEditorRole,
} from "@/lib/roles";

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
  const canEditJournal = canEditHomepageJournal(role) && Boolean(accessToken);
  const canEditAdminSections = canEditHomepageAdminSections(role) && Boolean(accessToken);
  const showEditorBar =
    Boolean(accessToken) && (isEditorRole(role) || isAdminRole(role)) && (canEditJournal || canEditAdminSections);
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

  const publicContent = homepage;
  const isEditing = canEditJournal || canEditAdminSections;
  const editContent = draft;
  const displayVersion = isEditing ? editContent.version : publicContent.version;

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
    (section: HomepagePhotoSection, itemIndex: number) => async (file: File) => {
      if (section === "journal" && !canEditJournal) {
        throw new Error("You do not have permission to edit journal photos.");
      }
      if (section !== "journal" && !canEditAdminSections) {
        throw new Error("Only admins can edit this homepage section.");
      }
      if (!accessToken) throw new Error("Sign in again to upload photos.");

      const result = await commitHomepagePhotoForEditor(accessToken, file, section, itemIndex);

      skipHomepageSyncRef.current = true;
      const applyPhoto = (prev: HomepageContent): HomepageContent => {
        if (section === "showcase") {
          const showcase = prev.showcase.map((item, index) =>
            index === itemIndex ? { ...item, imageUrl: result.publicUrl } : item,
          );
          return { ...prev, showcase, version: result.version };
        }
        if (section === "journal") {
          const journal = prev.journal.map((item, index) =>
            index === itemIndex ? { ...item, imageUrl: result.publicUrl } : item,
          );
          return { ...prev, journal, version: result.version };
        }
        const hero = prev.hero.map((item, index) =>
          index === itemIndex ? { ...item, imageUrl: result.publicUrl } : item,
        );
        return { ...prev, hero, version: result.version };
      };

      setDraft(applyPhoto);
      setSavedSnapshot(applyPhoto);

      refreshHomepage();
      return result.publicUrl;
    },
    [accessToken, canEditAdminSections, canEditJournal, refreshHomepage],
  );

  const handleSaved = useCallback(
    async (content: HomepageContent) => {
      commitHomepage(content);
      refreshHomepage();
    },
    [commitHomepage, refreshHomepage],
  );

  const editorBarRole = isAdminRole(role) ? "admin" : "editor";

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Header />
      {showEditorBar && accessToken ? (
        <HomepageEditorBar
          role={editorBarRole}
          draft={draft}
          savedSnapshot={savedSnapshot}
          onSaved={handleSaved}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <HomeHero
        slides={isEditing ? editContent.hero : publicContent.hero}
        imageVersion={displayVersion}
        editable={canEditAdminSections}
        onSlidesChange={(hero) => setDraft((prev) => ({ ...prev, hero }))}
        uploadPhoto={
          canEditAdminSections
            ? (itemIndex) => createPhotoUploader("hero", itemIndex)
            : undefined
        }
      />

      <ExperiencesShowcase
        items={isEditing ? editContent.showcase : publicContent.showcase}
        imageVersion={displayVersion}
        editable={canEditAdminSections}
        onItemsChange={(showcase) => setDraft((prev) => ({ ...prev, showcase }))}
        uploadPhoto={
          canEditAdminSections
            ? (section, itemIndex) => createPhotoUploader(section, itemIndex)
            : undefined
        }
      />

      <JourneysSplit
        slides={isEditing ? editContent.journeys : publicContent.journeys}
        editable={canEditAdminSections}
        onSlidesChange={(journeys) => setDraft((prev) => ({ ...prev, journeys }))}
      />

      <PillarsRow />

      <JournalPreview
        items={isEditing ? editContent.journal : publicContent.journal}
        imageVersion={displayVersion}
        editable={canEditJournal}
        onItemsChange={(journal) => setDraft((prev) => ({ ...prev, journal }))}
        uploadPhoto={
          canEditJournal ? (section, itemIndex) => createPhotoUploader(section, itemIndex) : undefined
        }
      />

      <Footer />
    </div>
  );
}
