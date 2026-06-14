import {
  extensionForFile,
  validateExperiencePhotoFile,
} from "@/lib/experience-photo-upload";
import { EXPERIENCE_PHOTOS_BUCKET } from "@/lib/experience-photos-config";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

export async function uploadProfilePhoto(file: File): Promise<string> {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error("Photo upload is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
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
    throw new Error("Sign in before uploading a profile photo.");
  }

  const ext = extensionForFile(file);
  const path = `${user.id}/profile-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
