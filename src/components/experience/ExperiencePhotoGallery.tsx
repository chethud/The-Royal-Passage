import { ImagePlus, Link2, Loader2, Star, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  isPublicImageUrl,
  uploadExperiencePhotos,
} from "@/lib/experience-photo-upload";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type ExperiencePhotoGalleryProps = {
  photoUrls: string[];
  onChange: (urls: string[]) => void;
  readOnly?: boolean;
  inputClass?: string;
  label?: string;
  hint?: string;
  photoAltPrefix?: string;
  /** Host wizard uses ember tokens; homestay owner forms use cream luxury panels. */
  surface?: "host" | "luxury";
};

export function ExperiencePhotoGallery({
  photoUrls,
  onChange,
  readOnly = false,
  inputClass = "mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm",
  label = "Experience photos",
  hint = "Browse and upload multiple images from your device. The first photo becomes the cover image.",
  photoAltPrefix = "Photo",
  surface = "host",
}: ExperiencePhotoGalleryProps) {
  const isLuxury = surface === "luxury";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewErrors, setPreviewErrors] = useState<Record<number, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const savedPhotos = photoUrls.map((url) => url.trim()).filter(Boolean);
  const uploadAvailable = isSupabaseBrowserConfigured();

  const appendUrls = (urls: string[]) => {
    if (urls.length === 0) return;
    onChange([...savedPhotos, ...urls]);
  };

  const removePhoto = (index: number) => {
    onChange(savedPhotos.filter((_, rowIndex) => rowIndex !== index));
    setPreviewErrors((prev) => {
      const next: Record<number, boolean> = {};
      for (const [key, value] of Object.entries(prev)) {
        const row = Number(key);
        if (row === index) continue;
        next[row > index ? row - 1 : row] = value;
      }
      return next;
    });
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length || readOnly) return;
    setUploadError(null);
    setUploading(true);
    try {
      const uploaded = await uploadExperiencePhotos(Array.from(files));
      appendUrls(uploaded);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload photos.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const addUrlDraft = () => {
    const next = urlDraft.trim();
    if (!next) return;
    if (!isPublicImageUrl(next)) {
      setUploadError("Enter a valid http(s) image link.");
      return;
    }
    setUploadError(null);
    appendUrls([next]);
    setUrlDraft("");
    setShowUrlInput(false);
  };

  const labelClass = isLuxury ? "eyebrow luxury-panel-label" : "eyebrow text-muted-foreground";
  const hintClass = isLuxury
    ? "mt-1 text-xs luxury-panel-body"
    : "mt-1 text-xs text-muted-foreground";
  const mutedTextClass = isLuxury ? "text-xs luxury-panel-body" : "text-xs text-muted-foreground";
  const emptyTextClass = isLuxury ? "text-sm luxury-panel-body" : "text-sm text-muted-foreground";
  const accentClass = isLuxury ? "text-[#4A0000]" : "text-ember";
  const uploadButtonClass = isLuxury
    ? cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[rgb(74_0_0/0.35)] bg-[rgb(255_255_255/0.35)] px-4 py-8 text-sm transition-colors luxury-panel-body",
        "hover:border-[rgb(74_0_0/0.5)] hover:bg-[rgb(255_255_255/0.5)] disabled:cursor-not-allowed disabled:opacity-50",
      )
    : cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ember/45 bg-background/20 px-4 py-8 text-sm transition-colors",
        "hover:border-ember/70 hover:bg-ember/5 disabled:cursor-not-allowed disabled:opacity-50",
      );
  const linkButtonClass = isLuxury
    ? "inline-flex items-center gap-1.5 text-xs luxury-panel-body underline-offset-2 hover:text-[#4A0000] hover:underline"
    : "inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline";
  const urlBoxClass = isLuxury
    ? "flex flex-wrap items-start gap-2 rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.35)] p-3"
    : "flex flex-wrap items-start gap-2 rounded-sm border border-[oklch(0.88_0.08_86_/_0.2)] bg-background/10 p-3";
  const addLinkButtonClass = isLuxury
    ? "rounded-sm border border-[rgb(74_0_0/0.35)] px-3 py-2 text-xs luxury-panel-body hover:bg-[rgb(74_0_0/0.06)]"
    : "rounded-sm border border-ember/50 px-3 py-2 text-xs hover:bg-ember/10";
  const cancelButtonClass = isLuxury
    ? "rounded-sm px-3 py-2 text-xs luxury-panel-body hover:text-[#4A0000]"
    : "rounded-sm px-3 py-2 text-xs text-muted-foreground hover:text-foreground";
  const photoBorderClass = isLuxury
    ? "border-[rgb(74_0_0/0.25)]"
    : "border-[oklch(0.88_0.08_86_/_0.25)]";
  const previewFallbackClass = isLuxury
    ? "flex aspect-[4/3] items-center justify-center bg-[rgb(255_255_255/0.35)] px-3 text-center text-xs luxury-panel-body"
    : "flex aspect-[4/3] items-center justify-center bg-muted/20 px-3 text-center text-xs text-muted-foreground";

  return (
    <div className="space-y-4">
      <div>
        <span className={labelClass}>{label}</span>
        <p className={hintClass}>{hint}</p>

        {!readOnly ? (
          <div className="mt-4 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              disabled={uploading || !uploadAvailable}
              onChange={(e) => void handleFilesSelected(e.target.files)}
            />

            <button
              type="button"
              disabled={uploading || !uploadAvailable}
              onClick={() => fileInputRef.current?.click()}
              className={uploadButtonClass}
            >
              {uploading ? (
                <>
                  <Loader2 className={cn("h-6 w-6 animate-spin", accentClass)} />
                  <span>Uploading photos…</span>
                </>
              ) : (
                <>
                  <ImagePlus className={cn("h-6 w-6", accentClass)} />
                  <span className={cn("font-medium", isLuxury ? "luxury-panel-heading" : "text-foreground")}>
                    Browse & upload photos
                  </span>
                  <span className={mutedTextClass}>JPEG, PNG, WebP, or GIF · up to 5 MB each</span>
                </>
              )}
            </button>

            {!uploadAvailable ? (
              <p className={mutedTextClass}>
                Photo upload requires Supabase configuration. Sign in as a host and ensure
                VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
              </p>
            ) : null}

            {!showUrlInput ? (
              <button type="button" onClick={() => setShowUrlInput(true)} className={linkButtonClass}>
                <Link2 className="h-3.5 w-3.5" />
                Paste an image link instead
              </button>
            ) : (
              <div className={urlBoxClass}>
                <input
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://…"
                  className={`${inputClass} min-w-[240px] flex-1`}
                />
                <button type="button" onClick={addUrlDraft} className={addLinkButtonClass}>
                  Add link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    setUrlDraft("");
                    setUploadError(null);
                  }}
                  className={cancelButtonClass}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : null}

        {uploadError ? <p className="mt-2 text-xs text-destructive">{uploadError}</p> : null}
      </div>

      {savedPhotos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {savedPhotos.map((url, index) => {
            const previewOk = isPublicImageUrl(url) && !previewErrors[index];
            return (
              <div
                key={`${url}-${index}`}
                className={cn("group relative overflow-hidden rounded-sm border", photoBorderClass)}
              >
                {previewOk ? (
                  <img
                    src={url}
                    alt={`${photoAltPrefix} ${index + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                    onError={() => setPreviewErrors((prev) => ({ ...prev, [index]: true }))}
                  />
                ) : (
                  <div className={previewFallbackClass}>{url}</div>
                )}

                {index === 0 ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm bg-black/65 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ember">
                    <Star className="h-3 w-3" />
                    Cover
                  </span>
                ) : null}

                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute right-2 top-2 rounded-sm bg-black/65 p-1.5 text-ink/90 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : readOnly ? (
        <p className={emptyTextClass}>No photos added.</p>
      ) : (
        <p className={emptyTextClass}>No photos uploaded yet.</p>
      )}
    </div>
  );
}
