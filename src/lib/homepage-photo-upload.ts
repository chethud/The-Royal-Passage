import { applyHomepagePhoto } from "@/lib/homepage-content-fns";
import {
  EXPERIENCE_PHOTOS_BUCKET,
  extensionForFile,
  validateExperiencePhotoFile,
} from "@/lib/experience-photo-upload";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

export type HomepagePhotoCommitResult = {
  publicUrl: string;
  version: number;
};

async function uploadHomepageEditorPhoto(file: File): Promise<string> {
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
    throw new Error("Sign in as editor before uploading photos.");
  }

  const ext = extensionForFile(file);
  const path = `homepage/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).upload(path, file, {
    cacheControl: "60",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function readJsonResponse(response: Response): Promise<{ error?: string; version?: number }> {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as { error?: string; version?: number };
  } catch {
    throw new Error(text.slice(0, 200) || "Unexpected server response.");
  }
}

async function saveHomepagePhotoViaApi(
  accessToken: string,
  section: "showcase" | "journal",
  itemIndex: number,
  publicUrl: string,
): Promise<HomepagePhotoCommitResult> {
  const response = await fetch("/api/homepage-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, section, itemIndex, publicUrl }),
  });

  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.error ?? `Failed to save homepage photo (${response.status}).`);
  }

  if (typeof payload.version !== "number") {
    throw new Error("Server did not return a content version.");
  }

  return { publicUrl, version: payload.version };
}

async function saveHomepagePhotoViaServerFn(
  accessToken: string,
  section: "showcase" | "journal",
  itemIndex: number,
  publicUrl: string,
): Promise<HomepagePhotoCommitResult> {
  return applyHomepagePhoto({
    data: { accessToken, section, itemIndex, publicUrl },
  });
}

export async function commitHomepagePhotoForEditor(
  accessToken: string,
  file: File,
  section: "showcase" | "journal",
  itemIndex: number,
): Promise<HomepagePhotoCommitResult> {
  const publicUrl = await uploadHomepageEditorPhoto(file);

  try {
    return await saveHomepagePhotoViaApi(accessToken, section, itemIndex, publicUrl);
  } catch (apiError) {
    try {
      return await saveHomepagePhotoViaServerFn(accessToken, section, itemIndex, publicUrl);
    } catch (serverFnError) {
      const apiMessage = apiError instanceof Error ? apiError.message : "API save failed.";
      const fnMessage = serverFnError instanceof Error ? serverFnError.message : "Server save failed.";
      throw new Error(`${apiMessage} ${fnMessage}`.trim());
    }
  }
}
