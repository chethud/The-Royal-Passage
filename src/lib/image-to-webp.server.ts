import sharp from "sharp";

const WEBP_MIME = "image/webp";
const DEFAULT_QUALITY = 82;
const MAX_EDGE = 2400;

export type WebpBytesResult = {
  bytes: Uint8Array;
  mimeType: typeof WEBP_MIME;
  fileName: string;
};

function replaceExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "photo";
  return `${base}.${ext}`;
}

/** Server-side JPEG/PNG (and most rasters) → WebP. GIFs stay as-is to preserve animation. */
export async function bytesToWebp(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
  options?: { quality?: number; maxEdge?: number },
): Promise<WebpBytesResult | { bytes: Uint8Array; mimeType: string; fileName: string }> {
  if (mimeType === WEBP_MIME || mimeType === "image/gif") {
    return { bytes, mimeType, fileName };
  }

  const quality = options?.quality ?? DEFAULT_QUALITY;
  const maxEdge = options?.maxEdge ?? MAX_EDGE;

  const pipeline = sharp(Buffer.from(bytes), { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const longest = Math.max(width, height);

  let next = pipeline;
  if (longest > maxEdge && longest > 0) {
    next = next.resize({
      width: width >= height ? maxEdge : undefined,
      height: height > width ? maxEdge : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const out = await next.webp({ quality, effort: 4 }).toBuffer();
  return {
    bytes: new Uint8Array(out),
    mimeType: WEBP_MIME,
    fileName: replaceExtension(fileName, "webp"),
  };
}
