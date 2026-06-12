import { Check, ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

type EditablePhotoFieldProps = {
  label: string;
  imageUrl: string;
  alt: string;
  onImageChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  uploadPhoto?: (file: File) => Promise<string>;
};

export function EditablePhotoField({
  label,
  imageUrl,
  alt,
  onImageChange,
  onAltChange,
  uploadPhoto,
}: EditablePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file || !uploadPhoto) return;
    setUploading(true);
    setError(null);
    setSavedHint(false);
    try {
      const url = await uploadPhoto(file);
      onImageChange(url);
      setSavedHint(true);
      window.setTimeout(() => setSavedHint(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2 rounded-sm border border-ember/35 bg-black/45 p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ember">{label}</p>
        <div className="flex items-center gap-2">
          {savedHint ? (
            <span className="inline-flex items-center gap-1 text-[0.62rem] font-medium text-emerald-300/90">
              <Check className="h-3 w-3" />
              Live
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || !uploadPhoto}
            className="inline-flex items-center gap-1.5 rounded-sm border border-ember/40 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ember hover:bg-ember/10 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
            Change photo
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      {error ? <p className="text-[0.68rem] text-red-300/90">{error}</p> : null}
      <label className="block space-y-1">
        <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/70">Alt text</span>
        <input
          value={alt}
          onChange={(event) => onAltChange(event.target.value)}
          className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)] bg-background/80 px-2 py-1.5 text-xs text-ink"
        />
      </label>
      <img key={imageUrl} src={imageUrl} alt={alt} className="h-20 w-full rounded-sm object-cover" />
    </div>
  );
}

type EditableTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
};

export function EditableTextField({ label, value, onChange, multiline }: EditableTextFieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ember">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)] bg-background/80 px-2 py-1.5 text-xs text-ink"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)] bg-background/80 px-2 py-1.5 text-xs text-ink"
        />
      )}
    </label>
  );
}
