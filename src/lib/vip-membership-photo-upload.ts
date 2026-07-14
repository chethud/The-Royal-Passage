import {
  extensionForFile,
  validateExperiencePhotoFile,
} from "@/lib/experience-photo-upload";
import {
  EXPERIENCE_PHOTOS_BUCKET,
  PHOTO_CACHE_CONTROL,
} from "@/lib/experience-photos-config";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

type VipMembershipPhotoKind = "aadhaar" | "professional-card";

async function uploadVipMembershipPhoto(
  file: File,
  kind: VipMembershipPhotoKind,
  label: string,
): Promise<string> {
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
    throw new Error(`Sign in before uploading your ${label}.`);
  }

  const ext = extensionForFile(file);
  const path = `${user.id}/vip-${kind}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

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

export function uploadVipAadhaarPhoto(file: File) {
  return uploadVipMembershipPhoto(file, "aadhaar", "Aadhaar photo");
}

export function uploadVipProfessionalCardPhoto(file: File) {
  return uploadVipMembershipPhoto(file, "professional-card", "card photo");
}
