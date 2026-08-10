import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  defaultMysoreTrailCatalog,
  TRAIL_CATEGORIES,
  type MysoreTrailCatalog,
  type MysoreTrailHeroDraft,
  type MysoreTrailPlaceDraft,
} from "@/data/mysore-trail-cms";
import type { TrailCategory } from "@/data/mysore-trail-journey";
import { saveMysoreTrailCatalog } from "@/lib/mysore-trail-fns";

type MysoreTrailCatalogEditorProps = {
  initial: MysoreTrailCatalog;
  accessToken: string;
  onPublished?: (catalog: MysoreTrailCatalog) => void;
};

type Tab = "places" | "heroes";

export function MysoreTrailCatalogEditor({
  initial,
  accessToken,
  onPublished,
}: MysoreTrailCatalogEditorProps) {
  const [catalog, setCatalog] = useState<MysoreTrailCatalog>(() => structuredClone(initial));
  const [tab, setTab] = useState<Tab>("places");
  const [selectedPlaceId, setSelectedPlaceId] = useState(initial.places[0]?.id ?? "");
  const [selectedHeroId, setSelectedHeroId] = useState(initial.heroes[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCatalog(structuredClone(initial));
    setSelectedPlaceId(initial.places[0]?.id ?? "");
    setSelectedHeroId(initial.heroes[0]?.id ?? "");
  }, [initial]);

  const selectedPlace = useMemo(
    () => catalog.places.find((place) => place.id === selectedPlaceId) ?? catalog.places[0],
    [catalog.places, selectedPlaceId],
  );

  const selectedHero = useMemo(
    () => catalog.heroes.find((hero) => hero.id === selectedHeroId) ?? catalog.heroes[0],
    [catalog.heroes, selectedHeroId],
  );

  const updatePlace = (placeId: string, patch: Partial<MysoreTrailPlaceDraft>) => {
    setCatalog((prev) => ({
      ...prev,
      places: prev.places.map((place) =>
        place.id === placeId ? { ...place, ...patch } : place,
      ),
    }));
  };

  const updateHero = (heroId: string, patch: Partial<MysoreTrailHeroDraft>) => {
    setCatalog((prev) => ({
      ...prev,
      heroes: prev.heroes.map((hero) => (hero.id === heroId ? { ...hero, ...patch } : hero)),
    }));
  };

  const toggleCategory = (placeId: string, category: TrailCategory) => {
    const place = catalog.places.find((item) => item.id === placeId);
    if (!place) return;
    const has = place.categories.includes(category);
    const next = has
      ? place.categories.filter((item) => item !== category)
      : [...place.categories, category];
    updatePlace(placeId, { categories: next.length ? next : place.categories });
  };

  const resetDefaults = () => {
    const fresh = defaultMysoreTrailCatalog();
    setCatalog(fresh);
    setSelectedPlaceId(fresh.places[0]?.id ?? "");
    setSelectedHeroId(fresh.heroes[0]?.id ?? "");
    setError(null);
  };

  const publish = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await saveMysoreTrailCatalog({
        data: { accessToken, catalog },
      });
      setCatalog(result.catalog);
      onPublished?.(result.catalog);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish Mysore Trail catalog.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-[rgb(42_0_0)]">
      <div className="rounded-2xl border border-[rgb(74_0_0/0.12)] bg-white/80 p-5 shadow-sm sm:p-6">
        <p className="max-w-3xl text-sm leading-relaxed text-[rgb(58_0_0/0.72)]">
          Edit the places and hero destinations shown on the public{" "}
          <Link
            to="/mysore-trail"
            search={{ place: undefined }}
            className="font-medium text-[rgb(42_0_0)] underline"
          >
            Mysore Trail
          </Link>{" "}
          page — names, short lines, images, and categories. Publish to update the live page for
          every visitor.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="luxury-btn-sm luxury-btn-primary"
            disabled={saving}
            onClick={() => void publish()}
          >
            {saving ? "Publishing…" : "Publish trail"}
          </button>
          <button
            type="button"
            className="luxury-btn-sm dashboard-chrome-btn"
            disabled={saving}
            onClick={resetDefaults}
          >
            Reset to defaults
          </button>
          {savedFlash ? (
            <span className="text-sm text-emerald-700">Published — live on Mysore Trail.</span>
          ) : null}
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`luxury-btn-sm ${tab === "places" ? "luxury-btn-primary" : "dashboard-chrome-btn"}`}
          onClick={() => setTab("places")}
        >
          Places ({catalog.places.length})
        </button>
        <button
          type="button"
          className={`luxury-btn-sm ${tab === "heroes" ? "luxury-btn-primary" : "dashboard-chrome-btn"}`}
          onClick={() => setTab("heroes")}
        >
          Hero destinations ({catalog.heroes.length})
        </button>
      </div>

      {tab === "places" && selectedPlace ? (
        <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="max-h-[70vh] space-y-1 overflow-y-auto rounded-2xl border border-[rgb(74_0_0/0.12)] bg-white/80 p-3">
            {catalog.places.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => setSelectedPlaceId(place.id)}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  place.id === selectedPlace.id
                    ? "bg-[rgb(42_0_0)] text-[#F7F1E8]"
                    : "text-[rgb(42_0_0)] hover:bg-[rgb(74_0_0/0.06)]"
                }`}
              >
                <span className="block font-medium">{place.shortName}</span>
                <span className="block truncate text-xs opacity-70">{place.id}</span>
              </button>
            ))}
          </aside>

          <section className="space-y-4 rounded-2xl border border-[rgb(74_0_0/0.12)] bg-white/80 p-5 sm:p-6">
            <div className="overflow-hidden rounded-xl border border-[rgb(74_0_0/0.12)]">
              <img
                src={selectedPlace.image}
                alt={selectedPlace.imageAlt}
                className="aspect-[16/9] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Place name">
                <input
                  value={selectedPlace.name}
                  onChange={(e) => updatePlace(selectedPlace.id, { name: e.target.value })}
                  className="luxury-input mt-1.5"
                />
              </Field>
              <Field label="Short name">
                <input
                  value={selectedPlace.shortName}
                  onChange={(e) => updatePlace(selectedPlace.id, { shortName: e.target.value })}
                  className="luxury-input mt-1.5"
                />
              </Field>
              <Field label="City label">
                <input
                  value={selectedPlace.cityLabel}
                  onChange={(e) => updatePlace(selectedPlace.id, { cityLabel: e.target.value })}
                  className="luxury-input mt-1.5"
                />
              </Field>
              <Field label="Image alt text">
                <input
                  value={selectedPlace.imageAlt}
                  onChange={(e) => updatePlace(selectedPlace.id, { imageAlt: e.target.value })}
                  className="luxury-input mt-1.5"
                />
              </Field>
            </div>

            <Field label="Short line (on photo card)">
              <input
                value={selectedPlace.tagline}
                onChange={(e) => updatePlace(selectedPlace.id, { tagline: e.target.value })}
                className="luxury-input mt-1.5"
              />
            </Field>

            <Field label="Image URL">
              <input
                value={selectedPlace.image}
                onChange={(e) => updatePlace(selectedPlace.id, { image: e.target.value })}
                className="luxury-input mt-1.5 font-mono text-xs sm:text-sm"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={selectedPlace.description}
                onChange={(e) => updatePlace(selectedPlace.id, { description: e.target.value })}
                rows={4}
                className="luxury-input mt-1.5 resize-y"
              />
            </Field>

            <div>
              <p className="eyebrow mb-2 !text-[#3a0000]">Categories</p>
              <div className="flex flex-wrap gap-2">
                {TRAIL_CATEGORIES.map((category) => {
                  const on = selectedPlace.categories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(selectedPlace.id, category)}
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${
                        on
                          ? "border-[rgb(42_0_0)] bg-[rgb(42_0_0)] text-[#F7F1E8]"
                          : "border-[rgb(74_0_0/0.22)] text-[rgb(42_0_0)] hover:border-[rgb(74_0_0/0.45)]"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "heroes" && selectedHero ? (
        <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="max-h-[70vh] space-y-1 overflow-y-auto rounded-2xl border border-[rgb(74_0_0/0.12)] bg-white/80 p-3">
            {catalog.heroes.map((hero) => (
              <button
                key={hero.id}
                type="button"
                onClick={() => setSelectedHeroId(hero.id)}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  hero.id === selectedHero.id
                    ? "bg-[rgb(42_0_0)] text-[#F7F1E8]"
                    : "text-[rgb(42_0_0)] hover:bg-[rgb(74_0_0/0.06)]"
                }`}
              >
                <span className="block font-medium">{hero.name}</span>
                <span className="block truncate text-xs opacity-70">{hero.eyebrow}</span>
              </button>
            ))}
          </aside>

          <section className="space-y-4 rounded-2xl border border-[rgb(74_0_0/0.12)] bg-white/80 p-5 sm:p-6">
            <div className="overflow-hidden rounded-xl border border-[rgb(74_0_0/0.12)]">
              <img
                src={selectedHero.image}
                alt={selectedHero.imageAlt}
                className="aspect-[16/9] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Destination name">
                <input
                  value={selectedHero.name}
                  onChange={(e) => updateHero(selectedHero.id, { name: e.target.value })}
                  className="luxury-input mt-1.5"
                />
              </Field>
              <Field label="Eyebrow">
                <input
                  value={selectedHero.eyebrow}
                  onChange={(e) => updateHero(selectedHero.id, { eyebrow: e.target.value })}
                  className="luxury-input mt-1.5"
                />
              </Field>
              <Field label="Location">
                <input
                  value={selectedHero.location}
                  onChange={(e) => updateHero(selectedHero.id, { location: e.target.value })}
                  className="luxury-input mt-1.5"
                />
              </Field>
              <Field label="Category label">
                <input
                  value={selectedHero.category}
                  onChange={(e) => updateHero(selectedHero.id, { category: e.target.value })}
                  className="luxury-input mt-1.5"
                />
              </Field>
            </div>

            <Field label="Title lines (one per line, max 3)">
              <textarea
                value={selectedHero.titleLines.join("\n")}
                onChange={(e) =>
                  updateHero(selectedHero.id, {
                    titleLines: (() => {
                      const lines = e.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .slice(0, 3);
                      return lines.length ? lines : selectedHero.titleLines;
                    })(),
                  })
                }
                rows={3}
                className="luxury-input mt-1.5 resize-y"
              />
            </Field>

            <Field label="Card lines (one per line, max 2)">
              <textarea
                value={selectedHero.cardLines.join("\n")}
                onChange={(e) =>
                  updateHero(selectedHero.id, {
                    cardLines: (() => {
                      const lines = e.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .slice(0, 2);
                      return lines.length ? lines : selectedHero.cardLines;
                    })(),
                  })
                }
                rows={2}
                className="luxury-input mt-1.5 resize-y"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={selectedHero.description}
                onChange={(e) => updateHero(selectedHero.id, { description: e.target.value })}
                rows={3}
                className="luxury-input mt-1.5 resize-y"
              />
            </Field>

            <Field label="Image URL">
              <input
                value={selectedHero.image}
                onChange={(e) => updateHero(selectedHero.id, { image: e.target.value })}
                className="luxury-input mt-1.5 font-mono text-xs sm:text-sm"
              />
            </Field>

            <Field label="Image alt text">
              <input
                value={selectedHero.imageAlt}
                onChange={(e) => updateHero(selectedHero.id, { imageAlt: e.target.value })}
                className="luxury-input mt-1.5"
              />
            </Field>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow !text-[#3a0000]">{label}</span>
      {children}
    </label>
  );
}
