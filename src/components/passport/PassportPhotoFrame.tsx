import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PassportPhotoFrameProps = {
  photoUrl: string | null;
  processing?: boolean;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
};

export function PassportPhotoFrame({
  photoUrl,
  processing = false,
  disabled = false,
  onFileSelected,
}: PassportPhotoFrameProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: disabled || processing,
    noClick: true,
    noKeyboard: true,
  });

  const handleClick = () => {
    if (disabled || processing) return;
    open();
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "passport-photo",
        isDragActive && "passport-photo--drag-active",
        processing && "passport-photo--processing",
      )}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={disabled || processing ? -1 : 0}
      aria-label={photoUrl ? "Change passport portrait" : "Upload passport portrait"}
    >
      <input {...getInputProps()} />

      {photoUrl ? (
        <img src={photoUrl} alt="Royal passport portrait" className="passport-photo__image" draggable={false} />
      ) : (
        <div className="passport-photo__placeholder" aria-hidden>
          <Camera className="passport-photo__placeholder-icon" />
          <span className="passport-photo__placeholder-text">Portrait</span>
        </div>
      )}

      <div className="passport-photo__frame-border" aria-hidden />

      {processing ? (
        <div className="passport-photo__overlay">
          <Loader2 className="passport-photo__spinner" aria-hidden />
          <span className="passport-photo__overlay-text">Developing…</span>
        </div>
      ) : null}

      {!photoUrl && !processing ? (
        <div className="passport-photo__hint">
          <span>Drop or click to add portrait</span>
        </div>
      ) : null}
    </div>
  );
}
