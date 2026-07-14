import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { resolveAccessToken } from "@/lib/auth-session";
import {
  saveHomepageHero,
  saveHomepageHeroHeadings,
  saveHomepageJournal,
  saveHomepageJourneys,
  saveHomepageShowcase,
} from "@/lib/homepage-content-fns";
import type { HomepageContent } from "@/lib/homepage-content";
import type { UserRole } from "@/lib/roles";

type HomepageEditorBarProps = {
  role: Extract<UserRole, "editor" | "admin">;
  draft: HomepageContent;
  savedSnapshot: HomepageContent;
  onSaved: (content: HomepageContent) => Promise<void>;
};

export function HomepageEditorBar({ role, draft, savedSnapshot, onSaved }: HomepageEditorBarProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const journalDirty = JSON.stringify(draft.journal) !== JSON.stringify(savedSnapshot.journal);
  const showcaseDirty = JSON.stringify(draft.showcase) !== JSON.stringify(savedSnapshot.showcase);
  const heroDirty = JSON.stringify(draft.hero) !== JSON.stringify(savedSnapshot.hero);
  const heroHeadingsDirty =
    JSON.stringify(draft.heroHeadings) !== JSON.stringify(savedSnapshot.heroHeadings);
  const journeysDirty = JSON.stringify(draft.journeys) !== JSON.stringify(savedSnapshot.journeys);

  const dirty =
    role === "admin"
      ? journalDirty || showcaseDirty || heroDirty || heroHeadingsDirty || journeysDirty
      : journalDirty || showcaseDirty || heroDirty || heroHeadingsDirty || journeysDirty;

  const save = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const token = await resolveAccessToken();
      const versions: number[] = [];

      if (journalDirty) {
        const journalResult = await saveHomepageJournal({
          data: { accessToken: token, items: draft.journal },
        });
        versions.push(journalResult.version);
      }

      if (journeysDirty) {
        const journeysResult = await saveHomepageJourneys({
          data: { accessToken: token, items: draft.journeys },
        });
        versions.push(journeysResult.version);
      }

      if (showcaseDirty) {
        const showcaseResult = await saveHomepageShowcase({
          data: { accessToken: token, items: draft.showcase },
        });
        versions.push(showcaseResult.version);
      }
      if (heroDirty) {
        const heroResult = await saveHomepageHero({
          data: { accessToken: token, items: draft.hero },
        });
        versions.push(heroResult.version);
      }
      if (heroHeadingsDirty) {
        const headingsResult = await saveHomepageHeroHeadings({
          data: { accessToken: token, items: draft.heroHeadings },
        });
        versions.push(headingsResult.version);
      }

      const version = versions.length > 0 ? Math.max(...versions) : draft.version;
      setMessage("Homepage updated — changes are live for all visitors.");
      await onSaved({ ...draft, version });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save homepage content.");
    } finally {
      setBusy(false);
    }
  };

  const hint =
    role === "admin"
      ? "Admin edit mode — journal, hero headings, slideshow, top 3 experiences, and heritage video. Photos save instantly; use Save for text and video links."
      : "Editor mode — homepage photos, hero headings, journal, top experiences, and heritage video. Photos save automatically; use Save for text and video links.";

  return (
    <div className="sticky top-0 z-50 border-b border-ember/35 bg-[oklch(0.14_0.06_22_/_0.96)] backdrop-blur-md">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <RoleBadge role={role} />
          <p className="max-w-xl text-sm text-ink/90">{hint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {message ? <p className="text-xs text-emerald-300/90">{message}</p> : null}
          {error ? <p className="text-xs text-red-300/90">{error}</p> : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy || !dirty}
            className="inline-flex items-center gap-2 rounded-sm border border-ember/50 bg-ember/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ember transition-colors hover:bg-ember/25 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
