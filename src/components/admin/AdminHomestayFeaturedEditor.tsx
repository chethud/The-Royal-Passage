import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { HomestayCard } from "@/components/homestays/HomestayCard";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import type { Homestay } from "@/data/homestays";
import { resolveAccessToken } from "@/lib/auth-session";
import {
  HOMESTAY_FEATURED_SLOT_COUNT,
} from "@/lib/homestay-featured-keys";
import {
  resolveFeaturedHomestays,
  saveFeaturedHomestays,
} from "@/lib/homestay-featured-fns";

type AdminHomestayFeaturedEditorProps = {
  homestays: Homestay[];
  initialSlugs: string[];
  onSaved: (slugs: string[]) => void;
};

function padFeaturedSlots(slugs: string[]): string[] {
  const next = slugs.slice(0, HOMESTAY_FEATURED_SLOT_COUNT);
  while (next.length < HOMESTAY_FEATURED_SLOT_COUNT) {
    next.push("");
  }
  return next;
}

export function AdminHomestayFeaturedEditor({
  homestays,
  initialSlugs,
  onSaved,
}: AdminHomestayFeaturedEditorProps) {
  const [slots, setSlots] = useState<string[]>(() => padFeaturedSlots(initialSlugs));
  const [savedSlots, setSavedSlots] = useState<string[]>(() => padFeaturedSlots(initialSlugs));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = padFeaturedSlots(initialSlugs);
    setSlots(next);
    setSavedSlots(next);
  }, [initialSlugs]);

  const dirty = JSON.stringify(slots) !== JSON.stringify(savedSlots);

  const preview = useMemo(
    () => resolveFeaturedHomestays(homestays, slots.filter(Boolean)),
    [homestays, slots],
  );

  const updateSlot = (index: number, slug: string) => {
    setSlots((current) => {
      const next = [...current];
      next[index] = slug;
      return next;
    });
    setMessage(null);
    setError(null);
  };

  const save = async () => {
    const slugs = slots.map((slug) => slug.trim());
    if (slugs.some((slug) => !slug)) {
      setError("Choose a homestay for all three featured slots.");
      return;
    }
    if (new Set(slugs).size !== HOMESTAY_FEATURED_SLOT_COUNT) {
      setError("Each featured slot must be a different homestay.");
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const token = await resolveAccessToken();
      const result = await saveFeaturedHomestays({
        data: { accessToken: token, slugs },
      });
      const nextSlots = padFeaturedSlots(result.slugs);
      setSlots(nextSlots);
      setSavedSlots(nextSlots);
      setMessage("Featured homestays updated. Changes are live on the homestays page.");
      onSaved(result.slugs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save featured homestays.");
    } finally {
      setBusy(false);
    }
  };

  if (homestays.length === 0) {
    return (
      <LuxuryCheckoutPanel>
        <p className="luxury-panel-body text-sm">
          No published homestays are available yet. Approve homestays first, then return here to
          choose the top three for the homestays homepage.
        </p>
      </LuxuryCheckoutPanel>
    );
  }

  return (
    <div className="space-y-6">
      <LuxuryCheckoutPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">
              Top 3 homestays
            </h2>
            <p className="luxury-panel-body mt-2 max-w-2xl text-sm">
              Choose which three homestays appear in the &ldquo;Rest Where Stories Live&rdquo;
              section on the public homestays page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy || !dirty}
            className="inline-flex items-center gap-2 rounded-sm border border-ember/50 bg-ember/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ember transition-colors hover:bg-ember/25 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save featured homestays
          </button>
        </div>

        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        {error ? (
          <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {slots.map((slug, index) => (
            <label key={index} className="block space-y-2">
              <span className="luxury-panel-body text-xs font-semibold uppercase tracking-[0.14em]">
                Featured slot {index + 1}
              </span>
              <select
                value={slug}
                onChange={(event) => updateSlot(index, event.target.value)}
                className="w-full rounded-sm border border-[rgb(74_0_0/0.18)] bg-white px-3 py-2.5 text-sm text-foreground"
              >
                <option value="">Select homestay…</option>
                {homestays.map((stay) => (
                  <option
                    key={stay.id}
                    value={stay.slug}
                    disabled={slots.some((selected, slotIndex) => slotIndex !== index && selected === stay.slug)}
                  >
                    {stay.title} ({stay.propertyType})
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <h3 className="luxury-panel-heading font-display text-lg tracking-wide">Live preview</h3>
        <p className="luxury-panel-body mt-2 text-sm">
          This is how the three cards will appear on `/homestays`.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {preview.map((stay) => (
            <HomestayCard key={stay.id} stay={stay} />
          ))}
        </div>
      </LuxuryCheckoutPanel>
    </div>
  );
}
