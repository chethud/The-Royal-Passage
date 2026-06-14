import { useCallback, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { EditablePhotoField } from "@/components/editor/EditableHomepageFields";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { useAuthUser } from "@/lib/auth-user";
import { resolveAccessToken } from "@/lib/auth-session";
import {
  normalizeHomepageContent,
  type HomepageContent,
  withHomepageCacheBust,
} from "@/lib/homepage-content";
import type { HomepagePhotoSection } from "@/lib/homepage-content-keys";
import {
  saveHomepageHero,
  saveHomepageJournal,
  saveHomepageShowcase,
} from "@/lib/homepage-content-fns";
import { commitHomepagePhotoForEditor } from "@/lib/homepage-photo-upload";

type AdminHomepagePhotoEditorProps = {
  initialContent: HomepageContent;
};

export function AdminHomepagePhotoEditor({ initialContent }: AdminHomepagePhotoEditorProps) {
  const { accessToken } = useAuthUser();
  const [content, setContent] = useState(() => normalizeHomepageContent(initialContent));
  const [savedSnapshot, setSavedSnapshot] = useState(() => normalizeHomepageContent(initialContent));
  const [busySection, setBusySection] = useState<HomepagePhotoSection | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createUploader = useCallback(
    (section: HomepagePhotoSection, itemIndex: number) => async (file: File) => {
      const token = accessToken ?? (await resolveAccessToken());
      const result = await commitHomepagePhotoForEditor(token, file, section, itemIndex);

      setContent((prev) => {
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
      });

      setSavedSnapshot((prev) => {
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
      });

      setMessage("Photo updated — live on the homepage.");
      return result.publicUrl;
    },
    [accessToken],
  );

  const saveSection = async (section: HomepagePhotoSection) => {
    setBusySection(section);
    setError(null);
    setMessage(null);
    try {
      const token = accessToken ?? (await resolveAccessToken());
      let version = content.version;

      if (section === "hero") {
        const result = await saveHomepageHero({ data: { accessToken: token, items: content.hero } });
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
      setMessage("Alt text and details saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save section.");
    } finally {
      setBusySection(null);
    }
  };

  const heroDirty = JSON.stringify(content.hero) !== JSON.stringify(savedSnapshot.hero);
  const showcaseDirty = JSON.stringify(content.showcase) !== JSON.stringify(savedSnapshot.showcase);
  const journalDirty = JSON.stringify(content.journal) !== JSON.stringify(savedSnapshot.journal);

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm text-muted-foreground">
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
          <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Hero slideshow</h2>
          <button
            type="button"
            disabled={!heroDirty || busySection !== null}
            onClick={() => void saveSection("hero")}
            className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {busySection === "hero" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save hero
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {content.hero.map((slide, index) => (
            <EditablePhotoField
              key={slide.id}
              label={`Slide ${index + 1}`}
              imageUrl={withHomepageCacheBust(slide.imageUrl, content.version)}
              alt={slide.alt}
              onImageChange={(url) =>
                setContent((prev) => ({
                  ...prev,
                  hero: prev.hero.map((item, i) => (i === index ? { ...item, imageUrl: url } : item)),
                }))
              }
              onAltChange={(alt) =>
                setContent((prev) => ({
                  ...prev,
                  hero: prev.hero.map((item, i) => (i === index ? { ...item, alt } : item)),
                }))
              }
              uploadPhoto={createUploader("hero", index)}
            />
          ))}
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Top experiences</h2>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.showcase.map((item, index) => (
            <EditablePhotoField
              key={item.id}
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
          ))}
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Journal stories</h2>
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
        <div className="grid gap-4 md:grid-cols-2">
          {content.journal.map((item, index) => (
            <EditablePhotoField
              key={item.id}
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
