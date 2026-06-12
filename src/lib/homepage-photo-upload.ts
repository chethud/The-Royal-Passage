import { applyHomepagePhoto } from "@/lib/homepage-content-fns";
import { validateExperiencePhotoFile } from "@/lib/experience-photo-upload";

export type HomepagePhotoCommitResult = {
  publicUrl: string;
  version: number;
};

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

async function readJsonResponse(
  response: Response,
): Promise<{ error?: string; publicUrl?: string; version?: number }> {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as { error?: string; publicUrl?: string; version?: number };
  } catch {
    throw new Error(text.slice(0, 200) || "Unexpected server response.");
  }
}

async function saveHomepagePhotoViaApi(
  accessToken: string,
  section: "showcase" | "journal",
  itemIndex: number,
  file: File,
): Promise<HomepagePhotoCommitResult> {
  const base64 = await fileToBase64(file);
  const response = await fetch("/api/homepage-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken,
      section,
      itemIndex,
      fileName: file.name,
      mimeType: file.type,
      base64,
    }),
  });

  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.error ?? `Failed to save homepage photo (${response.status}).`);
  }

  if (typeof payload.version !== "number" || typeof payload.publicUrl !== "string") {
    throw new Error("Server did not return the saved photo.");
  }

  return { publicUrl: payload.publicUrl, version: payload.version };
}

async function saveHomepagePhotoViaServerFn(
  accessToken: string,
  section: "showcase" | "journal",
  itemIndex: number,
  file: File,
): Promise<HomepagePhotoCommitResult> {
  const base64 = await fileToBase64(file);
  return applyHomepagePhoto({
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

  try {
    return await saveHomepagePhotoViaApi(accessToken, section, itemIndex, file);
  } catch (apiError) {
    try {
      return await saveHomepagePhotoViaServerFn(accessToken, section, itemIndex, file);
    } catch (serverFnError) {
      const apiMessage = apiError instanceof Error ? apiError.message : "API save failed.";
      const fnMessage =
        serverFnError instanceof Error ? serverFnError.message : "Server save failed.";
      if (apiMessage === fnMessage) {
        throw new Error(apiMessage);
      }
      throw new Error(`${apiMessage} ${fnMessage}`.trim());
    }
  }
}
