import {
  extensionForFile,
  validateExperiencePhotoFile,
} from "@/lib/experience-photo-upload";
import { EXPERIENCE_PHOTOS_BUCKET, MAX_EXPERIENCE_PHOTO_BYTES } from "@/lib/experience-photos-config";
import { fileToWebpFile } from "@/lib/image-to-webp";
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

  const webpFile = await fileToWebpFile(file);
  if (webpFile.size > MAX_EXPERIENCE_PHOTO_BYTES) {
    throw new Error(`${label} must be 5 MB or smaller after WebP conversion.`);
  }

  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error(`Sign in before uploading your ${label}.`);
  }

  const ext = extensionForFile(webpFile);
  const path = `${user.id}/vip-${kind}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

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

export function uploadVipAadhaarPhoto(file: File) {
  return uploadVipMembershipPhoto(file, "aadhaar", "Aadhaar photo");
}

export function uploadVipProfessionalCardPhoto(file: File) {
  return uploadVipMembershipPhoto(file, "professional-card", "card photo");
}
