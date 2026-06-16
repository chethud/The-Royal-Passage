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
};

export function ExperiencePhotoGallery({
  photoUrls,
  onChange,
  readOnly = false,
  inputClass = "mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm",
}: ExperiencePhotoGalleryProps) {
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

  return (
    <div className="space-y-4">
      <div>
        <span className="eyebrow text-muted-foreground">Experience photos</span>
        <p className="mt-1 text-xs text-muted-foreground">
          Browse and upload multiple images from your device. The first photo becomes the cover image.
        </p>

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
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ember/45 bg-background/20 px-4 py-8 text-sm transition-colors",
                "hover:border-ember/70 hover:bg-ember/5 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-ember" />
                  <span>Uploading photos…</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-ember" />
                  <span className="font-medium text-foreground">Browse & upload photos</span>
                  <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF · up to 5 MB each</span>
                </>
              )}
            </button>

            {!uploadAvailable ? (
              <p className="text-xs text-muted-foreground">
                Photo upload requires Supabase configuration. Sign in as a host and ensure
                VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
              </p>
            ) : null}

            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                <Link2 className="h-3.5 w-3.5" />
                Paste an image link instead
              </button>
            ) : (
              <div className="flex flex-wrap items-start gap-2 rounded-sm border border-[oklch(0.88_0.08_86_/_0.2)] bg-background/10 p-3">
                <input
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://…"
                  className={`${inputClass} min-w-[240px] flex-1`}
                />
                <button
                  type="button"
                  onClick={addUrlDraft}
                  className="rounded-sm border border-ember/50 px-3 py-2 text-xs hover:bg-ember/10"
                >
                  Add link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    setUrlDraft("");
                    setUploadError(null);
                  }}
                  className="rounded-sm px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
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
                className="group relative overflow-hidden rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)]"
              >
                {previewOk ? (
                  <img
                    src={url}
                    alt={`Experience photo ${index + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                    onError={() => setPreviewErrors((prev) => ({ ...prev, [index]: true }))}
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-muted/20 px-3 text-center text-xs text-muted-foreground">
                    {url}
                  </div>
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
        <p className="text-sm text-muted-foreground">No photos added.</p>
      ) : (
        <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
      )}
    </div>
  );
}
