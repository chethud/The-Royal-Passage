export const EXPERIENCE_PHOTOS_BUCKET = "experience-photos";
export const MAX_EXPERIENCE_PHOTO_BYTES = 5 * 1024 * 1024;

/** Long-lived browser/CDN cache for uploaded photos (1 year). */
export const PHOTO_CACHE_CONTROL = "31536000";

export const ALLOWED_EXPERIENCE_PHOTO_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
