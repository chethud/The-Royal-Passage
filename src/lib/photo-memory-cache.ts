/**
 * In-memory browser cache for photo URLs — keeps decoded Image elements warm
 * so returning to a page can reuse them without waiting on the network again.
 */

const MAX_ENTRIES = 64;
const cache = new Map<string, HTMLImageElement>();

function touch(url: string, image: HTMLImageElement) {
  cache.delete(url);
  cache.set(url, image);
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest == null) break;
    cache.delete(oldest);
  }
}

/** Warm the memory cache for one or more photo URLs. Safe to call repeatedly. */
export function warmPhotoCache(urls: Array<string | null | undefined>): void {
  if (typeof window === "undefined") return;

  for (const raw of urls) {
    const url = raw?.trim();
    if (!url) continue;
    if (cache.has(url)) {
      const existing = cache.get(url);
      if (existing) touch(url, existing);
      continue;
    }

    const image = new Image();
    image.decoding = "async";
    image.src = url;
    const settle = () => touch(url, image);
    if (image.complete) {
      settle();
    } else {
      image.addEventListener("load", settle, { once: true });
      image.addEventListener("error", () => cache.delete(url), { once: true });
    }
  }
}

export function getCachedPhoto(url: string): HTMLImageElement | undefined {
  const image = cache.get(url);
  if (image) touch(url, image);
  return image;
}

export function clearPhotoCache(): void {
  cache.clear();
}
