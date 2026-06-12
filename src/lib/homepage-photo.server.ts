import { deleteServerCache } from "@/lib/cache.server";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  normalizeHomepageContent,
  parseVersionValue,
  type HomepageContent,
} from "@/lib/homepage-content";
import {
  EXPERIENCE_PHOTOS_BUCKET,
  MAX_EXPERIENCE_PHOTO_BYTES,
} from "@/lib/experience-photo-upload";
import {
  getSupabaseConfigError,
  isSupabaseReadable,
} from "@/lib/env.server";
import { getSupabaseAdmin, getSupabaseServerRead } from "@/lib/supabase/admin";

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

export type ApplyHomepagePhotoResult = {
  publicUrl: string;
  version: number;
};

const ALLOWED_HOMEPAGE_PHOTO_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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

async function uploadHomepagePhotoAdmin(
  userId: string,
  fileName: string,
  mimeType: string,
  base64: string,
): Promise<string> {
  if (!ALLOWED_HOMEPAGE_PHOTO_MIME.has(mimeType)) {
    throw new Error("Use a JPEG, PNG, WebP, or GIF image.");
  }

  const bytes = decodeBase64ToBytes(base64);
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

export async function requireEditor(accessToken: string) {
  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("You must be signed in as an editor.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "editor") {
    throw new Error("Only editors can perform this action.");
  }

  return user;
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

export async function fetchHomepageContentFromDb(): Promise<HomepageContent> {
  if (!isSupabaseReadable()) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  const supabase = getSupabaseServerRead();
  if (!supabase) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

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
