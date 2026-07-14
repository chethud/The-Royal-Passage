/** Browser-side conversion of raster uploads to WebP for smaller, faster pages. */

const WEBP_MIME = "image/webp";
const DEFAULT_QUALITY = 0.82;
/** Longest edge — keeps uploads sharp but reasonable for hero/gallery. */
const MAX_EDGE = 2400;

function replaceExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "photo";
  return `${base}.${ext}`;
}

/**
 * Convert JPEG/PNG (and other drawable) images to WebP.
 * Already-WebP files are returned as-is. Animated GIF stays GIF (first frame would lose motion).
 */
export async function fileToWebpFile(
  file: File,
  options?: { quality?: number; maxEdge?: number },
): Promise<File> {
  if (file.type === WEBP_MIME) {
    return file;
  }
  if (file.type === "image/gif") {
    return file;
  }

  const quality = options?.quality ?? DEFAULT_QUALITY;
  const maxEdge = options?.maxEdge ?? MAX_EDGE;

  const bitmap = await createImageBitmap(file);
  try {
    let { width, height } = bitmap;
    const longest = Math.max(width, height);
    if (longest > maxEdge) {
      const scale = maxEdge / longest;
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not prepare image for WebP conversion.");
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("WebP conversion failed in this browser."));
            return;
          }
          resolve(result);
        },
        WEBP_MIME,
        quality,
      );
    });

    return new File([blob], replaceExtension(file.name, "webp"), {
      type: WEBP_MIME,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
