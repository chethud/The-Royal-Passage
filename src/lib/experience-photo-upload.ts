import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import {
  ALLOWED_EXPERIENCE_PHOTO_MIME,
  EXPERIENCE_PHOTOS_BUCKET,
  MAX_EXPERIENCE_PHOTO_BYTES,
} from "@/lib/experience-photos-config";
import { fileToWebpFile } from "@/lib/image-to-webp";

export { EXPERIENCE_PHOTOS_BUCKET, MAX_EXPERIENCE_PHOTO_BYTES } from "@/lib/experience-photos-config";

const ALLOWED_MIME = ALLOWED_EXPERIENCE_PHOTO_MIME;

export function isPublicImageUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function extensionForFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export function validateExperiencePhotoFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return `${file.name}: use a JPEG, PNG, WebP, or GIF image.`;
  }
  if (file.size > MAX_EXPERIENCE_PHOTO_BYTES) {
    return `${file.name}: must be 5 MB or smaller.`;
  }
  return null;
}

export async function uploadExperiencePhoto(file: File): Promise<string> {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error("Photo upload is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const validationError = validateExperiencePhotoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const webpFile = await fileToWebpFile(file);
  if (webpFile.size > MAX_EXPERIENCE_PHOTO_BYTES) {
    throw new Error(`${file.name}: must be 5 MB or smaller after WebP conversion.`);
  }

  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sign in before uploading photos.");
  }

  const ext = extensionForFile(webpFile);
  const path = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).upload(path, webpFile, {
    cacheControl: "3600",
    upsert: false,
    contentType: webpFile.type,
  });
  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadExperiencePhotos(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadExperiencePhoto(file));
  }
  return urls;
}
