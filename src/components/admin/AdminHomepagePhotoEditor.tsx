import { useCallback, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { EditablePhotoField, EditableTextField } from "@/components/editor/EditableHomepageFields";
import { LivePreviewLink } from "@/components/admin/LivePreviewLink";
import { ShowcaseExperiencePicker } from "@/components/admin/ShowcaseExperiencePicker";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { useAuthUser } from "@/lib/auth-user";
import { resolveAccessToken } from "@/lib/auth-session";
import {
  heroPhotoCoords,
  heroPhotoFlatIndex,
  normalizeHomepageContent,
  type HomepageContent,
  withHomepageCacheBust,
} from "@/lib/homepage-content";
import type { HomepagePhotoSection } from "@/lib/homepage-content-keys";
import {
  saveHomepageHero,
  saveHomepageHeroHeadings,
  saveHomepageHomestayHero,
  saveHomepageJournal,
  saveHomepageShowcase,
} from "@/lib/homepage-content-fns";
import { commitHomepagePhotoForEditor } from "@/lib/homepage-photo-upload";
import {
  showcaseItemFromExperience,
  type ShowcaseExperienceOption,
} from "@/lib/showcase-from-experience";

type AdminHomepagePhotoEditorProps = {
  initialContent: HomepageContent;
  experiences?: ShowcaseExperienceOption[];
};

type BusySection = HomepagePhotoSection | "heroHeadings";

function applyPhotoToContent(
  prev: HomepageContent,
  section: HomepagePhotoSection,
  itemIndex: number,
  publicUrl: string,
  version: number,
): HomepageContent {
  if (section === "showcase") {
    const showcase = prev.showcase.map((item, index) =>
      index === itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    return { ...prev, showcase, version };
  }
  if (section === "journal") {
    const journal = prev.journal.map((item, index) =>
      index === itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    return { ...prev, journal, version };
  }
  if (section === "homestayHero") {
    const homestayHero = prev.homestayHero.map((item, index) =>
      index === itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    return { ...prev, homestayHero, version };
  }
  const { packIndex, slideIndex } = heroPhotoCoords(itemIndex);
  const heroSlideshows = prev.heroSlideshows.map((pack, pi) => {
    if (pi !== packIndex) return pack;
    return {
      ...pack,
      slides: pack.slides.map((slide, si) =>
        si === slideIndex ? { ...slide, imageUrl: publicUrl } : slide,
      ),
    };
  });
  return {
    ...prev,
    heroSlideshows,
    hero: heroSlideshows[0]?.slides ?? prev.hero,
    version,
  };
}

export function AdminHomepagePhotoEditor({
  initialContent,
  experiences = [],
}: AdminHomepagePhotoEditorProps) {
  const { accessToken } = useAuthUser();
  const [content, setContent] = useState(() => normalizeHomepageContent(initialContent));
  const [savedSnapshot, setSavedSnapshot] = useState(() => normalizeHomepageContent(initialContent));
  const [busySection, setBusySection] = useState<BusySection | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createUploader = useCallback(
    (section: HomepagePhotoSection, itemIndex: number) => async (file: File) => {
      const token = accessToken ?? (await resolveAccessToken());
      const result = await commitHomepagePhotoForEditor(token, file, section, itemIndex);

      setContent((prev) => applyPhotoToContent(prev, section, itemIndex, result.publicUrl, result.version));
      setSavedSnapshot((prev) =>
        applyPhotoToContent(prev, section, itemIndex, result.publicUrl, result.version),
      );

      setMessage("Photo updated — live on the homepage.");
      return result.publicUrl;
    },
    [accessToken],
  );

  const saveSection = async (section: BusySection) => {
    setBusySection(section);
    setError(null);
    setMessage(null);
    try {
      const token = accessToken ?? (await resolveAccessToken());
      let version = content.version;

      if (section === "hero") {
        const result = await saveHomepageHero({
          data: { accessToken: token, items: content.heroSlideshows },
        });
        version = result.version;
      } else if (section === "homestayHero") {
        const result = await saveHomepageHomestayHero({
          data: { accessToken: token, items: content.homestayHero },
        });
        version = result.version;
      } else if (section === "heroHeadings") {
        const result = await saveHomepageHeroHeadings({
          data: { accessToken: token, items: content.heroHeadings },
        });
        version = result.version;
      } else if (section === "showcase") {
        const result = await saveHomepageShowcase({
          data: { accessToken: token, items: content.showcase },
        });
        version = result.version;
      } else {
        const result = await saveHomepageJournal({
          data: { accessToken: token, items: content.journal },
        });
        version = result.version;
      }

      const next = { ...content, version };
      setContent(next);
      setSavedSnapshot(next);
      setMessage(
        section === "heroHeadings"
          ? "Hero headings saved — they rotate on each homepage refresh."
          : section === "hero"
            ? "Hero slideshows saved — pack 1 is constant; packs 2 & 3 rotate at random on visit."
            : section === "homestayHero"
              ? "Homestay hero photos saved — live on /homestays."
              : "Alt text and details saved.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save section.");
    } finally {
      setBusySection(null);
    }
  };

  const heroDirty =
    JSON.stringify(content.heroSlideshows) !== JSON.stringify(savedSnapshot.heroSlideshows);
  const homestayHeroDirty =
    JSON.stringify(content.homestayHero) !== JSON.stringify(savedSnapshot.homestayHero);
  const heroHeadingsDirty =
    JSON.stringify(content.heroHeadings) !== JSON.stringify(savedSnapshot.heroHeadings);
  const showcaseDirty = JSON.stringify(content.showcase) !== JSON.stringify(savedSnapshot.showcase);
  const journalDirty = JSON.stringify(content.journal) !== JSON.stringify(savedSnapshot.journal);

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
        Replace homepage images here. Photos save instantly when you upload. Use Save on each section
        after editing alt text.
      </p>

      {message ? <p className="text-sm text-ember">{message}</p> : null}
      {error ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <LuxuryCheckoutPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Hero headings</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#4A0000]/80">
              Heading 1 is priority. All three rotate on each homepage refresh or return visit.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LivePreviewLink to="/" hash="hero" />
            <button
              type="button"
              disabled={!heroHeadingsDirty || busySection !== null}
              onClick={() => void saveSection("heroHeadings")}
              className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {busySection === "heroHeadings" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save headings
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.heroHeadings.map((heading, index) => (
            <div
              key={heading.id}
              className="space-y-2 rounded-sm border border-[rgb(74_0_0/0.16)] bg-[rgb(255_252_244/0.9)] p-3"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#2A0000]">
                {index === 0 ? "Heading 1 · Priority" : `Heading ${index + 1}`}
              </p>
              <EditableTextField
                surface="panel"
                label="Eyebrow"
                value={heading.eyebrow}
                onChange={(eyebrow) =>
                  setContent((prev) => ({
                    ...prev,
                    heroHeadings: prev.heroHeadings.map((item, i) =>
                      i === index ? { ...item, eyebrow } : item,
                    ),
                  }))
                }
              />
              <EditableTextField
                surface="panel"
                label="Line 1"
                value={heading.line1}
                onChange={(line1) =>
                  setContent((prev) => ({
                    ...prev,
                    heroHeadings: prev.heroHeadings.map((item, i) =>
                      i === index ? { ...item, line1 } : item,
                    ),
                  }))
                }
              />
              <EditableTextField
                surface="panel"
                label="Accent line"
                value={heading.line2}
                onChange={(line2) =>
                  setContent((prev) => ({
                    ...prev,
                    heroHeadings: prev.heroHeadings.map((item, i) =>
                      i === index ? { ...item, line2 } : item,
                    ),
                  }))
                }
              />
              <EditableTextField
                surface="panel"
                label="Line 3"
                value={heading.line3}
                onChange={(line3) =>
                  setContent((prev) => ({
                    ...prev,
                    heroHeadings: prev.heroHeadings.map((item, i) =>
                      i === index ? { ...item, line3 } : item,
                    ),
                  }))
                }
              />
              <EditableTextField
                surface="panel"
                label="Body"
                value={heading.body}
                multiline
                onChange={(body) =>
                  setContent((prev) => ({
                    ...prev,
                    heroHeadings: prev.heroHeadings.map((item, i) =>
                      i === index ? { ...item, body } : item,
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Hero slideshows</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#4A0000]/80">
              Slideshow 1 is constant (priority fallback). On each homepage refresh or return visit,
              slideshow 2 or 3 is chosen at random. Set different photos in 2 and 3 so the hero changes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LivePreviewLink to="/" hash="hero" />
            <button
              type="button"
              disabled={!heroDirty || busySection !== null}
              onClick={() => void saveSection("hero")}
              className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {busySection === "hero" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save slideshows
            </button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {content.heroSlideshows.map((pack, packIndex) => (
            <div
              key={pack.id}
              className="space-y-3 rounded-sm border border-[rgb(74_0_0/0.16)] bg-[rgb(255_252_244/0.9)] p-3"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#2A0000]">
                {packIndex === 0
                  ? "Slideshow 1 · Constant"
                  : `Slideshow ${packIndex + 1} · Random`}
              </p>
              <div className="grid gap-3">
                {pack.slides.map((slide, slideIndex) => {
                  const flatIndex = heroPhotoFlatIndex(packIndex, slideIndex);
                  return (
                    <EditablePhotoField
                      key={slide.id}
                      surface="panel"
                      label={`Photo ${slideIndex + 1}`}
                      imageUrl={withHomepageCacheBust(slide.imageUrl, content.version)}
                      alt={slide.alt}
                      onImageChange={(url) =>
                        setContent((prev) => {
                          const heroSlideshows = prev.heroSlideshows.map((row, pi) => {
                            if (pi !== packIndex) return row;
                            return {
                              ...row,
                              slides: row.slides.map((item, si) =>
                                si === slideIndex ? { ...item, imageUrl: url } : item,
                              ),
                            };
                          });
                          return {
                            ...prev,
                            heroSlideshows,
                            hero: heroSlideshows[0]?.slides ?? prev.hero,
                          };
                        })
                      }
                      onAltChange={(alt) =>
                        setContent((prev) => {
                          const heroSlideshows = prev.heroSlideshows.map((row, pi) => {
                            if (pi !== packIndex) return row;
                            return {
                              ...row,
                              slides: row.slides.map((item, si) =>
                                si === slideIndex ? { ...item, alt } : item,
                              ),
                            };
                          });
                          return {
                            ...prev,
                            heroSlideshows,
                            hero: heroSlideshows[0]?.slides ?? prev.hero,
                          };
                        })
                      }
                      uploadPhoto={createUploader("hero", flatIndex)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">
              Homestay hero photos
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#4A0000]/80">
              Slideshow on the Royal Homestays landing page (/homestays). Upload up to five photos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LivePreviewLink to="/homestays" />
            <button
              type="button"
              disabled={!homestayHeroDirty || busySection !== null}
              onClick={() => void saveSection("homestayHero")}
              className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {busySection === "homestayHero" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save homestay hero
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.homestayHero.map((slide, index) => (
            <EditablePhotoField
              key={slide.id}
              surface="panel"
              label={`Photo ${index + 1}`}
              imageUrl={withHomepageCacheBust(slide.imageUrl, content.version)}
              alt={slide.alt}
              onImageChange={(url) =>
                setContent((prev) => ({
                  ...prev,
                  homestayHero: prev.homestayHero.map((item, i) =>
                    i === index ? { ...item, imageUrl: url } : item,
                  ),
                }))
              }
              onAltChange={(alt) =>
                setContent((prev) => ({
                  ...prev,
                  homestayHero: prev.homestayHero.map((item, i) =>
                    i === index ? { ...item, alt } : item,
                  ),
                }))
              }
              uploadPhoto={createUploader("homestayHero", index)}
            />
          ))}
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Top experiences</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#4A0000]/80">
              Pick a published host experience for each slot, or keep a custom photo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LivePreviewLink to="/" hash="experiences" />
            <button
              type="button"
              disabled={!showcaseDirty || busySection !== null}
              onClick={() => void saveSection("showcase")}
              className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {busySection === "showcase" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save showcase
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.showcase.map((item, index) => (
            <div key={item.id} className="space-y-2">
              <ShowcaseExperiencePicker
                experiences={experiences}
                currentHref={item.href}
                disabled={busySection !== null}
                onSelect={(experience) =>
                  setContent((prev) => ({
                    ...prev,
                    showcase: prev.showcase.map((row, i) =>
                      i === index ? showcaseItemFromExperience(experience, row) : row,
                    ),
                  }))
                }
              />
              <EditablePhotoField
                surface="panel"
                label={item.title}
                imageUrl={withHomepageCacheBust(item.imageUrl, content.version)}
                alt={item.alt}
                onImageChange={(url) =>
                  setContent((prev) => ({
                    ...prev,
                    showcase: prev.showcase.map((row, i) =>
                      i === index ? { ...row, imageUrl: url } : row,
                    ),
                  }))
                }
                onAltChange={(alt) =>
                  setContent((prev) => ({
                    ...prev,
                    showcase: prev.showcase.map((row, i) => (i === index ? { ...row, alt } : row)),
                  }))
                }
                uploadPhoto={createUploader("showcase", index)}
              />
              {item.href.startsWith("/experiences/") ? (
                <p className="text-[0.65rem] text-[#4A0000]/70">Links to {item.href}</p>
              ) : null}
            </div>
          ))}
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Journal stories</h2>
          <div className="flex flex-wrap items-center gap-3">
            <LivePreviewLink to="/" hash="journal" />
            <button
              type="button"
              disabled={!journalDirty || busySection !== null}
              onClick={() => void saveSection("journal")}
              className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {busySection === "journal" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save journal
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {content.journal.map((item, index) => (
            <EditablePhotoField
              key={item.id}
              surface="panel"
              label={item.title}
              imageUrl={withHomepageCacheBust(item.imageUrl, content.version)}
              alt={item.alt}
              onImageChange={(url) =>
                setContent((prev) => ({
                  ...prev,
                  journal: prev.journal.map((row, i) =>
                    i === index ? { ...row, imageUrl: url } : row,
                  ),
                }))
              }
              onAltChange={(alt) =>
                setContent((prev) => ({
                  ...prev,
                  journal: prev.journal.map((row, i) => (i === index ? { ...row, alt } : row)),
                }))
              }
              uploadPhoto={createUploader("journal", index)}
            />
          ))}
        </div>
      </LuxuryCheckoutPanel>
    </div>
  );
}
