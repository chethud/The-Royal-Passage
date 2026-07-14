import { deleteServerCache } from "@/lib/cache.server";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  normalizeHomepageContent as normalizeHomepageContentForUi,
} from "@/lib/homepage-content";
import {
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_HERO_HEADINGS_KEY,
  HOMEPAGE_HERO_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_JOURNEYS_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  heroPhotoCoords,
  parseVersionValue,
  type HomepagePhotoSection,
} from "@/lib/homepage-content-keys";
import {
  ALLOWED_EXPERIENCE_PHOTO_MIME,
  EXPERIENCE_PHOTOS_BUCKET,
  MAX_EXPERIENCE_PHOTO_BYTES,
} from "@/lib/experience-photos-config";
import { getSupabaseConfigError } from "@/lib/env.server";
import { verifySupabaseAccessToken } from "@/lib/auth-verify.server";
import { fetchUserProfile } from "@/lib/profiles";
import { hasAnyRole, hasRole } from "@/lib/roles";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ApplyHomepagePhotoInput = {
  accessToken: string;
  section: HomepagePhotoSection;
  itemIndex: number;
  publicUrl: string;
};

export type CommitHomepagePhotoUploadInput = {
  accessToken: string;
  section: HomepagePhotoSection;
  itemIndex: number;
  fileName: string;
  mimeType: string;
  base64: string;
};

export type CommitHomepagePhotoUploadBytesInput = {
  accessToken: string;
  section: HomepagePhotoSection;
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

export async function requireHomepagePhotoAccess(accessToken: string, section: HomepagePhotoSection) {
  const verified = await verifySupabaseAccessToken(accessToken);
  const supabase = getSupabaseAdmin();
  const profile = await fetchUserProfile(supabase, verified.id);

  if (!profile) {
    throw new Error("Could not verify your account role.");
  }

  if (!hasAnyRole(profile.roles, ["editor", "admin"], profile.role)) {
    throw new Error("Only editors or admins can edit homepage photos.");
  }

  // All homepage photo sections are available to editors and admins.
  void section;

  return { id: verified.id, email: verified.email ?? undefined, role: profile.role };
}

/** @deprecated Use requireHomepagePhotoAccess */
export async function requireEditor(accessToken: string) {
  return requireHomepagePhotoAccess(accessToken, "journal");
}

export async function requireHomepageAdmin(accessToken: string) {
  const verified = await verifySupabaseAccessToken(accessToken);
  const supabase = getSupabaseAdmin();
  const profile = await fetchUserProfile(supabase, verified.id);

  if (!profile || !hasRole(profile.roles, "admin", profile.role)) {
    throw new Error("Only admins can perform this action.");
  }

  return { id: verified.id, email: verified.email ?? undefined };
}

/** Editors and admins — multi-role accounts included via user_roles. */
export async function requireHomepageJournalEditor(accessToken: string) {
  const verified = await verifySupabaseAccessToken(accessToken);
  const supabase = getSupabaseAdmin();
  const profile = await fetchUserProfile(supabase, verified.id);

  if (!profile || !hasAnyRole(profile.roles, ["editor", "admin"], profile.role)) {
    throw new Error("Only editors or admins can edit homepage content.");
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
    .in("key", [
      HOMEPAGE_SHOWCASE_KEY,
      HOMEPAGE_JOURNAL_KEY,
      HOMEPAGE_HERO_KEY,
      HOMEPAGE_HERO_HEADINGS_KEY,
      HOMEPAGE_JOURNEYS_KEY,
      HOMEPAGE_VERSION_KEY,
    ]);

  if (error) {
    throw new Error(error.message);
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  if (
    !byKey.has(HOMEPAGE_SHOWCASE_KEY) &&
    !byKey.has(HOMEPAGE_JOURNAL_KEY) &&
    !byKey.has(HOMEPAGE_HERO_KEY) &&
    !byKey.has(HOMEPAGE_HERO_HEADINGS_KEY) &&
    !byKey.has(HOMEPAGE_JOURNEYS_KEY)
  ) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  return normalizeHomepageContentForUi({
    showcase: byKey.get(HOMEPAGE_SHOWCASE_KEY),
    journal: byKey.get(HOMEPAGE_JOURNAL_KEY),
    hero: byKey.get(HOMEPAGE_HERO_KEY),
    heroHeadings: byKey.get(HOMEPAGE_HERO_HEADINGS_KEY),
    journeys: byKey.get(HOMEPAGE_JOURNEYS_KEY),
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

  await requireHomepagePhotoAccess(input.accessToken, input.section);
  const supabase = getSupabaseAdmin();
  const current = await loadHomepageContentFromDb(supabase);
  const publicUrl = input.publicUrl.trim();

  if (input.section === "showcase") {
    if (input.itemIndex < 0 || input.itemIndex > 2) {
      throw new Error("Showcase photo index must be between 0 and 2.");
    }
    const items = current.showcase.map((item, index) =>
      index === input.itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    await writePlatformSetting(supabase, HOMEPAGE_SHOWCASE_KEY, items);
  } else if (input.section === "journal") {
    if (input.itemIndex < 0 || input.itemIndex > 2) {
      throw new Error("Journal photo index must be between 0 and 2.");
    }
    const items = current.journal.map((item, index) =>
      index === input.itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    await writePlatformSetting(supabase, HOMEPAGE_JOURNAL_KEY, items);
  } else {
    if (input.itemIndex < 0 || input.itemIndex > 11) {
      throw new Error("Hero photo index must be between 0 and 11.");
    }
    const { packIndex, slideIndex } = heroPhotoCoords(input.itemIndex);
    const packs = current.heroSlideshows.map((pack, pi) => {
      if (pi !== packIndex) return pack;
      return {
        ...pack,
        slides: pack.slides.map((slide, si) =>
          si === slideIndex ? { ...slide, imageUrl: publicUrl } : slide,
        ),
      };
    });
    await writePlatformSetting(supabase, HOMEPAGE_HERO_KEY, packs);
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

  const user = await requireHomepagePhotoAccess(input.accessToken, input.section);
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

  const user = await requireHomepagePhotoAccess(input.accessToken, input.section);
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
