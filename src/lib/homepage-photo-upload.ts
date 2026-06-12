import { validateExperiencePhotoFile } from "@/lib/experience-photo-upload";
import { commitHomepagePhoto } from "@/lib/homepage-content-fns";

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

export type HomepagePhotoCommitResult = {
  publicUrl: string;
  version: number;
};

export async function commitHomepagePhotoForEditor(
  accessToken: string,
  file: File,
  section: "showcase" | "journal",
  itemIndex: number,
): Promise<HomepagePhotoCommitResult> {
  const validationError = validateExperiencePhotoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const base64 = await fileToBase64(file);
  return commitHomepagePhoto({
    data: {
      accessToken,
      section,
      itemIndex,
      fileName: file.name,
      mimeType: file.type,
      base64,
    },
  });
}
