import { validateExperiencePhotoFile } from "@/lib/experience-photo-upload";
import { uploadHomepagePhoto } from "@/lib/homepage-content-fns";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read the selected image."));
        return;
      }
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      if (!base64) {
        reject(new Error("Could not read the selected image."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

export async function uploadHomepagePhotoForEditor(
  accessToken: string,
  file: File,
): Promise<string> {
  const validationError = validateExperiencePhotoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const base64 = await fileToBase64(file);
  const { publicUrl } = await uploadHomepagePhoto({
    data: {
      accessToken,
      fileName: file.name,
      mimeType: file.type,
      base64,
    },
  });

  return publicUrl;
}
