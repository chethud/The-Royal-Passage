import { useRouter } from "@tanstack/react-router";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { saveHomepageJournal, saveHomepageShowcase } from "@/lib/homepage-content-fns";
import type { HomepageJournalItem, HomepageShowcaseItem } from "@/lib/homepage-content";

type HomepageEditorBarProps = {
  accessToken: string;
  showcase: HomepageShowcaseItem[];
  journal: HomepageJournalItem[];
  dirty: boolean;
  onSaved: () => void;
};

export function HomepageEditorBar({
  accessToken,
  showcase,
  journal,
  dirty,
  onSaved,
}: HomepageEditorBarProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await saveHomepageShowcase({ data: { accessToken, items: showcase } });
      await saveHomepageJournal({ data: { accessToken, items: journal } });
      setMessage("Homepage updated — changes are live.");
      onSaved();
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save homepage content.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 border-b border-ember/35 bg-[oklch(0.14_0.06_22_/_0.96)] backdrop-blur-md">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <RoleBadge role="editor" />
          <p className="text-sm text-ink/90">
            Edit mode — update photos and text below, then save to publish live.
          </p>
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
