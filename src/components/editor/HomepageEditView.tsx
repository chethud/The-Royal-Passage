import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HomeHero } from "@/components/site/HomeHero";
import { ExperiencesShowcase } from "@/components/site/ExperiencesShowcase";
import { JourneysSplit } from "@/components/site/JourneysSplit";
import { PillarsRow } from "@/components/site/PillarsRow";
import { JournalPreview } from "@/components/site/JournalPreview";
import { HomepageEditorBar } from "@/components/editor/HomepageEditorBar";
import { useAuthUser } from "@/lib/auth-user";
import { normalizeHomepageContent, type HomepageContent } from "@/lib/homepage-content";
import type { HomepagePhotoSection } from "@/lib/homepage-content-keys";
import { commitHomepagePhotoForEditor } from "@/lib/homepage-photo-upload";
import {
  canEditHomepageAdminSections,
  canEditHomepageJournal,
  canEditHomepageJourneys,
  isAdminRole,
  type UserRole,
} from "@/lib/roles";

type HomepageEditViewProps = {
  homepage: HomepageContent;
  onRefresh: () => void;
  /** When set, limits which sections are editable (defaults from role). */
  editorRole?: Extract<UserRole, "editor" | "admin">;
};

export function HomepageEditView({ homepage, onRefresh, editorRole }: HomepageEditViewProps) {
  const { role, accessToken } = useAuthUser();
  const resolvedRole: Extract<UserRole, "editor" | "admin"> =
    editorRole ?? (isAdminRole(role) ? "admin" : "editor");

  const canEditJournal = canEditHomepageJournal(resolvedRole) && Boolean(accessToken);
  const canEditJourneys = canEditHomepageJourneys(resolvedRole) && Boolean(accessToken);
  const canEditAdminSections = canEditHomepageAdminSections(resolvedRole) && Boolean(accessToken);

  const normalizedHomepage = normalizeHomepageContent(homepage);
  const [draft, setDraft] = useState<HomepageContent>(normalizedHomepage);
  const [savedSnapshot, setSavedSnapshot] = useState<HomepageContent>(normalizedHomepage);
  const skipHomepageSyncRef = useRef(false);

  useEffect(() => {
    if (skipHomepageSyncRef.current) {
      skipHomepageSyncRef.current = false;
      return;
    }
    const next = normalizeHomepageContent(homepage);
    setDraft(next);
    setSavedSnapshot(next);
  }, [homepage]);

  const isEditing = canEditJournal || canEditJourneys || canEditAdminSections;
  const editContent = draft;
  const displayVersion = editContent.version;

  const commitHomepage = useCallback((next: HomepageContent) => {
    skipHomepageSyncRef.current = true;
    setDraft(next);
    setSavedSnapshot(next);
  }, []);

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
      onRefresh();
      return result.publicUrl;
    },
    [accessToken, canEditAdminSections, canEditJournal, onRefresh],
  );

  const handleSaved = useCallback(
    async (content: HomepageContent) => {
      commitHomepage(content);
      onRefresh();
    },
    [commitHomepage, onRefresh],
  );

  if (!isEditing || !accessToken) {
    return (
      <p className="container-page py-16 text-sm text-muted-foreground">
        Sign in with permission to edit the homepage.
      </p>
    );
  }

  return (
    <>
      <HomepageEditorBar
        role={resolvedRole}
        draft={draft}
        savedSnapshot={savedSnapshot}
        onSaved={handleSaved}
      />

      <HomeHero
        slides={editContent.hero}
        imageVersion={displayVersion}
        editable={canEditAdminSections}
        onSlidesChange={(hero) => setDraft((prev) => ({ ...prev, hero }))}
        uploadPhoto={
          canEditAdminSections ? (itemIndex) => createPhotoUploader("hero", itemIndex) : undefined
        }
      />

      <ExperiencesShowcase
        items={editContent.showcase}
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
        slides={editContent.journeys}
        editable={canEditJourneys}
        onSlidesChange={(journeys) => setDraft((prev) => ({ ...prev, journeys }))}
      />

      <PillarsRow />

      <JournalPreview
        items={editContent.journal}
        imageVersion={displayVersion}
        editable={canEditJournal}
        onItemsChange={(journal) => setDraft((prev) => ({ ...prev, journal }))}
        uploadPhoto={
          canEditJournal ? (section, itemIndex) => createPhotoUploader(section, itemIndex) : undefined
        }
      />
    </>
  );
}

type HomepageEditPageShellProps = {
  homepage: HomepageContent;
  onRefresh: () => void;
  editorRole?: Extract<UserRole, "editor" | "admin">;
};

export function HomepageEditPageShell({ homepage, onRefresh, editorRole }: HomepageEditPageShellProps) {
  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Header />
      <HomepageEditView homepage={homepage} onRefresh={onRefresh} editorRole={editorRole} />
      <Footer />
    </div>
  );
}
