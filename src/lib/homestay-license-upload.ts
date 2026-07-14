import {
  extensionForFile,
  validateExperiencePhotoFile,
} from "@/lib/experience-photo-upload";
import { EXPERIENCE_PHOTOS_BUCKET, MAX_EXPERIENCE_PHOTO_BYTES } from "@/lib/experience-photos-config";
import { fileToWebpFile } from "@/lib/image-to-webp";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

export async function uploadHomestayLicenseCertificate(file: File): Promise<string> {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error("Document upload is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const validationError = validateExperiencePhotoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const webpFile = await fileToWebpFile(file);
  if (webpFile.size > MAX_EXPERIENCE_PHOTO_BYTES) {
    throw new Error("Certificate must be 5 MB or smaller after WebP conversion.");
  }

  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sign in before uploading your certificate or license.");
  }

  const ext = extensionForFile(webpFile);
  const path = `${user.id}/homestay-license-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

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
