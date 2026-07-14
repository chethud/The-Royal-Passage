import {
  extensionForFile,
  validateExperiencePhotoFile,
} from "@/lib/experience-photo-upload";
import {
  EXPERIENCE_PHOTOS_BUCKET,
  PHOTO_CACHE_CONTROL,
} from "@/lib/experience-photos-config";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

export async function uploadHomestayLicenseCertificate(file: File): Promise<string> {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error("Document upload is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const validationError = validateExperiencePhotoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sign in before uploading your certificate or license.");
  }

  const ext = extensionForFile(file);
  const path = `${user.id}/homestay-license-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).upload(path, file, {
    cacheControl: PHOTO_CACHE_CONTROL,
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
