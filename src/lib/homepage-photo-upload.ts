import { resolveAccessToken } from "@/lib/auth-session";
import { validateExperiencePhotoFile } from "@/lib/experience-photo-upload";

import type { HomepagePhotoSection } from "@/lib/homepage-content-keys";

export type HomepagePhotoCommitResult = {
  publicUrl: string;
  version: number;
};

/** Vercel request bodies are capped at ~4.5 MB — stay under that for hosted uploads. */
export const MAX_HOMEPAGE_PHOTO_BYTES = 4 * 1024 * 1024;

export function validateHomepagePhotoFile(file: File): string | null {
  const baseError = validateExperiencePhotoFile(file);
  if (baseError) return baseError;
  if (file.size > MAX_HOMEPAGE_PHOTO_BYTES) {
    return `${file.name}: must be 4 MB or smaller on the live site.`;
  }
  return null;
}

async function readJsonResponse(
  response: Response,
): Promise<{ error?: string; publicUrl?: string; version?: number }> {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as { error?: string; publicUrl?: string; version?: number };
  } catch {
    const cleaned = text.replace(/^A server error has occurred\s*/i, "").trim();
    throw new Error(cleaned.slice(0, 240) || "Unexpected server response.");
  }
}

async function saveHomepagePhotoViaApi(
  section: HomepagePhotoSection,
  itemIndex: number,
  file: File,
): Promise<HomepagePhotoCommitResult> {
  const accessToken = await resolveAccessToken();
  const response = await fetch("/api/homepage-photo", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": file.type || "application/octet-stream",
      "X-Section": section,
      "X-Item-Index": String(itemIndex),
      "X-File-Name": encodeURIComponent(file.name || "photo.jpg"),
    },
    body: file,
  });

  const payload = await readJsonResponse(response);
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error("Image is too large for upload. Use a photo under 4 MB.");
    }
    throw new Error(payload.error ?? `Failed to save homepage photo (${response.status}).`);
  }

  if (typeof payload.version !== "number" || typeof payload.publicUrl !== "string") {
    throw new Error("Server did not return the saved photo.");
  }

  return { publicUrl: payload.publicUrl, version: payload.version };
}

export async function commitHomepagePhotoForEditor(
  _accessToken: string | null | undefined,
  file: File,
  section: HomepagePhotoSection,
  itemIndex: number,
): Promise<HomepagePhotoCommitResult> {
  const validationError = validateHomepagePhotoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  return saveHomepagePhotoViaApi(section, itemIndex, file);
}
