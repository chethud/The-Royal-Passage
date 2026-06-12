import { useRef, useState } from "react";
import {
  isPublicImageUrl,
  uploadExperiencePhotos,
} from "@/lib/experience-photo-upload";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

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

  const trimmedUrls = photoUrls.map((url) => url.trim()).filter(Boolean);
  const previewablePhotos = photoUrls
    .map((url, index) => ({ url: url.trim(), index }))
    .filter(({ url, index }) => url && isPublicImageUrl(url) && !previewErrors[index]);

  const appendUrls = (urls: string[]) => {
    if (urls.length === 0) return;
    const existing = photoUrls.map((url) => url.trim()).filter(Boolean);
    onChange([...existing, ...urls]);
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

  const uploadAvailable = isSupabaseBrowserConfigured();

  return (
    <div className="space-y-4">
      <div>
        <span className="eyebrow text-muted-foreground">Experience photos</span>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload images from your device or paste public image links. The first photo becomes the cover
          image.
        </p>

        {!readOnly ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
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
              className="rounded-sm border border-ember/50 px-4 py-2 text-sm hover:bg-ember/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Browse & upload"}
            </button>
            {!uploadAvailable ? (
              <span className="text-xs text-muted-foreground">
                Upload requires Supabase browser auth env vars.
              </span>
            ) : null}
          </div>
        ) : null}

        {uploadError ? <p className="mt-2 text-xs text-destructive">{uploadError}</p> : null}
      </div>

      {!readOnly ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Or add a photo URL</p>
          {photoUrls.map((url, index) => (
            <div key={`photo-${index}`} className="flex flex-wrap items-start gap-2">
              <input
                value={url}
                onChange={(e) => {
                  const next = [...photoUrls];
                  next[index] = e.target.value;
                  onChange(next);
                  setPreviewErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[index];
                    return copy;
                  });
                }}
                placeholder={`https://… photo ${index + 1}`}
                className={`${inputClass} min-w-[240px] flex-1`}
              />
              {photoUrls.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onChange(photoUrls.filter((_, rowIndex) => rowIndex !== index))}
                  className="rounded-sm border border-destructive/40 px-3 py-2 text-xs text-destructive"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...photoUrls, ""])}
            className="rounded-sm border border-ember/50 px-4 py-2 text-sm hover:bg-ember/10"
          >
            Add photo URL
          </button>
        </div>
      ) : trimmedUrls.length > 0 ? (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {trimmedUrls.map((url) => (
            <li key={url} className="truncate">
              {url}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No photos added.</p>
      )}

      {previewablePhotos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {previewablePhotos.map(({ url, index }) => (
            <div
              key={`${url}-${index}`}
              className="overflow-hidden rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)]"
            >
              <img
                src={url}
                alt="Experience photo preview"
                className="aspect-[4/3] w-full object-cover"
                onError={() => setPreviewErrors((prev) => ({ ...prev, [index]: true }))}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
