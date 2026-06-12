import { deleteServerCache } from "@/lib/cache.server";
import {
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  normalizeHomepageContent,
  parseVersionValue,
} from "@/lib/homepage-content-keys";
import {
  ALLOWED_EXPERIENCE_PHOTO_MIME,
  EXPERIENCE_PHOTOS_BUCKET,
  MAX_EXPERIENCE_PHOTO_BYTES,
} from "@/lib/experience-photos-config";
import { getSupabaseConfigError } from "@/lib/env.server";
import { verifySupabaseAccessToken } from "@/lib/auth-verify.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ApplyHomepagePhotoInput = {
  accessToken: string;
  section: "showcase" | "journal";
  itemIndex: number;
  publicUrl: string;
};

export type CommitHomepagePhotoUploadInput = {
  accessToken: string;
  section: "showcase" | "journal";
  itemIndex: number;
  fileName: string;
  mimeType: string;
  base64: string;
};

export type CommitHomepagePhotoUploadBytesInput = {
  accessToken: string;
  section: "showcase" | "journal";
  itemIndex: number;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
};

export type ApplyHomepagePhotoResult = {
  publicUrl: string;
  version: number;
};

const ALLOWED_HOMEPAGE_PHOTO_MIME = ALLOWED_EXPERIENCE_PHOTO_MIME;

function extensionForMime(mimeType: string, fileName: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

function decodeBase64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toJsonb(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

async function uploadHomepagePhotoAdminBytes(
  userId: string,
  fileName: string,
  mimeType: string,
  bytes: Uint8Array,
): Promise<string> {
  if (!ALLOWED_HOMEPAGE_PHOTO_MIME.has(mimeType)) {
    throw new Error("Use a JPEG, PNG, WebP, or GIF image.");
  }

  if (bytes.byteLength > MAX_EXPERIENCE_PHOTO_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const supabase = getSupabaseAdmin();
  const ext = extensionForMime(mimeType, fileName);
  const path = `homepage/${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).upload(path, bytes, {
    cacheControl: "60",
    upsert: false,
    contentType: mimeType,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadHomepagePhotoAdmin(
  userId: string,
  fileName: string,
  mimeType: string,
  base64: string,
): Promise<string> {
  return uploadHomepagePhotoAdminBytes(userId, fileName, mimeType, decodeBase64ToBytes(base64));
}

export async function requireEditor(accessToken: string) {
  const verified = await verifySupabaseAccessToken(accessToken);
  const supabase = getSupabaseAdmin();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", verified.id)
    .maybeSingle();

  if (profileError || profile?.role !== "editor") {
    throw new Error("Only editors can perform this action.");
  }

  return { id: verified.id, email: verified.email ?? undefined };
}

function invalidateHomepageCache() {
  deleteServerCache(HOMEPAGE_CACHE_KEY);
}

export async function writePlatformSetting(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  key: string,
  value: unknown,
) {
  const { error } = await supabase.from("platform_settings").upsert(
    {
      key,
      value: toJsonb(value),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

export async function bumpHomepageVersion(
  supabase: ReturnType<typeof getSupabaseAdmin>,
): Promise<number> {
  const version = Date.now();
  await writePlatformSetting(supabase, HOMEPAGE_VERSION_KEY, { updatedAt: version });
  invalidateHomepageCache();
  return version;
}

async function loadHomepageContentFromDb(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", [HOMEPAGE_SHOWCASE_KEY, HOMEPAGE_JOURNAL_KEY, HOMEPAGE_VERSION_KEY]);

  if (error) {
    throw new Error(error.message);
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  return normalizeHomepageContent({
    showcase: byKey.get(HOMEPAGE_SHOWCASE_KEY),
    journal: byKey.get(HOMEPAGE_JOURNAL_KEY),
    version: parseVersionValue(byKey.get(HOMEPAGE_VERSION_KEY)),
  });
}

export async function applyHomepagePhotoCore(
  input: ApplyHomepagePhotoInput,
): Promise<ApplyHomepagePhotoResult> {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input.publicUrl);
  } catch {
    throw new Error("Uploaded photo URL is invalid.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Uploaded photo URL must be public http(s).");
  }

  await requireEditor(input.accessToken);
  const supabase = getSupabaseAdmin();
  const current = await loadHomepageContentFromDb(supabase);
  const publicUrl = input.publicUrl.trim();

  if (input.section === "showcase") {
    const items = current.showcase.map((item, index) =>
      index === input.itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    await writePlatformSetting(supabase, HOMEPAGE_SHOWCASE_KEY, items);
  } else {
    const items = current.journal.map((item, index) =>
      index === input.itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    await writePlatformSetting(supabase, HOMEPAGE_JOURNAL_KEY, items);
  }

  const version = await bumpHomepageVersion(supabase);
  return { publicUrl, version };
}

export async function commitHomepagePhotoWithUploadBytes(
  input: CommitHomepagePhotoUploadBytesInput,
): Promise<ApplyHomepagePhotoResult> {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const user = await requireEditor(input.accessToken);
  const publicUrl = await uploadHomepagePhotoAdminBytes(
    user.id,
    input.fileName,
    input.mimeType,
    input.bytes,
  );

  return applyHomepagePhotoCore({
    accessToken: input.accessToken,
    section: input.section,
    itemIndex: input.itemIndex,
    publicUrl,
  });
}

export async function commitHomepagePhotoWithUpload(
  input: CommitHomepagePhotoUploadInput,
): Promise<ApplyHomepagePhotoResult> {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const user = await requireEditor(input.accessToken);
  const publicUrl = await uploadHomepagePhotoAdmin(
    user.id,
    input.fileName,
    input.mimeType,
    input.base64,
  );

  return applyHomepagePhotoCore({
    accessToken: input.accessToken,
    section: input.section,
    itemIndex: input.itemIndex,
    publicUrl,
  });
}
