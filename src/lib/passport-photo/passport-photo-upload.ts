import { validateExperiencePhotoFile } from "@/lib/experience-photo-upload";
import { uploadProfilePhoto } from "@/lib/profile-photo-upload";
import { processPassportPhoto } from "@/lib/passport-photo/passport-photo-processing";
import type { ProcessPassportPhotoResult } from "@/lib/passport-photo/types";
import type { FaceBox } from "@/lib/passport-photo/types";

export type PassportPhotoUploadResult = ProcessPassportPhotoResult & {
  uploadedUrl: string;
};

export async function handlePassportPhotoUpload(
  file: File,
  faceBox: FaceBox | null,
): Promise<PassportPhotoUploadResult> {
  const validationError = validateExperiencePhotoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const processed = await processPassportPhoto(file, faceBox);
  const uploadFile = new File([processed.blob], `passport-portrait-${Date.now()}.jpg`, {
    type: "image/jpeg",
  });
  const uploadedUrl = await uploadProfilePhoto(uploadFile);

  return {
    ...processed,
    uploadedUrl,
  };
}
