import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { deleteServerCache } from "@/lib/cache.server";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  normalizeHomepageContent,
  type HomepageContent,
  type HomepageJournalItem,
  type HomepageShowcaseItem,
} from "@/lib/homepage-content";
import {
  EXPERIENCE_PHOTOS_BUCKET,
  MAX_EXPERIENCE_PHOTO_BYTES,
} from "@/lib/experience-photo-upload";
import { isSupabaseConfigured, isSupabaseReadable } from "@/lib/env.server";
import { getSupabaseAdmin, getSupabaseServerRead } from "@/lib/supabase/admin";

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

function parseVersionValue(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  if (typeof raw === "string" && raw.trim()) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  }
  return 0;
}

const showcaseIconKeySchema = z.enum(["pottery", "flame", "heritage"]);

const showcaseItemSchema = z.object({
  id: z.string().min(1),
  iconKey: showcaseIconKeySchema,
  title: z.string().min(1).max(120),
  imageUrl: z.string().min(1),
  alt: z.string().min(1).max(200),
  href: z.string().min(1).max(200),
});

const journalItemSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().min(1),
  alt: z.string().min(1).max(200),
  title: z.string().min(1).max(120),
  excerpt: z.string().min(1).max(400),
});

async function requireEditor(accessToken: string) {
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

async function bumpHomepageVersion(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<number> {
  const version = Date.now();
  const { error } = await supabase.from("platform_settings").upsert(
    { key: HOMEPAGE_VERSION_KEY, value: version },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
  invalidateHomepageCache();
  return version;
}

/** Load homepage CMS content from Supabase — safe to call directly from route loaders. */
export async function fetchHomepageContent(): Promise<HomepageContent> {
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
    console.error("[homepage] Failed to load platform_settings:", error.message);
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  return normalizeHomepageContent({
    showcase: byKey.get(HOMEPAGE_SHOWCASE_KEY),
    journal: byKey.get(HOMEPAGE_JOURNAL_KEY),
    version: parseVersionValue(byKey.get(HOMEPAGE_VERSION_KEY)),
  });
}

export const getHomepageContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageContent> => fetchHomepageContent(),
);

export const saveHomepageShowcase = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(showcaseItemSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<{ items: HomepageShowcaseItem[]; version: number }> => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Homepage save is not configured on the server. Set SUPABASE_SERVICE_ROLE_KEY in your hosting environment (e.g. Vercel).",
      );
    }

    await requireEditor(data.accessToken);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("platform_settings").upsert(
      {
        key: HOMEPAGE_SHOWCASE_KEY,
        value: data.items,
      },
      { onConflict: "key" },
    );

    if (error) throw new Error(error.message);

    const version = await bumpHomepageVersion(supabase);
    return { items: data.items, version };
  });

export const saveHomepageJournal = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(journalItemSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<{ items: HomepageJournalItem[]; version: number }> => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Homepage save is not configured on the server. Set SUPABASE_SERVICE_ROLE_KEY in your hosting environment (e.g. Vercel).",
      );
    }

    await requireEditor(data.accessToken);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("platform_settings").upsert(
      {
        key: HOMEPAGE_JOURNAL_KEY,
        value: data.items,
      },
      { onConflict: "key" },
    );

    if (error) throw new Error(error.message);

    const version = await bumpHomepageVersion(supabase);
    return { items: data.items, version };
  });

export const uploadHomepagePhoto = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      fileName: z.string().min(1).max(200),
      mimeType: z.string().min(1),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }): Promise<{ publicUrl: string }> => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Photo upload is not configured on the server. Set SUPABASE_SERVICE_ROLE_KEY in your hosting environment (e.g. Vercel).",
      );
    }

    const user = await requireEditor(data.accessToken);

    if (!ALLOWED_HOMEPAGE_PHOTO_MIME.has(data.mimeType)) {
      throw new Error("Use a JPEG, PNG, WebP, or GIF image.");
    }

    const bytes = decodeBase64ToBytes(data.base64);
    if (bytes.byteLength > MAX_EXPERIENCE_PHOTO_BYTES) {
      throw new Error("Image must be 5 MB or smaller.");
    }

    const supabase = getSupabaseAdmin();
    const ext = extensionForMime(data.mimeType, data.fileName);
    const path = `homepage/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const { error } = await supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).upload(path, bytes, {
      cacheControl: "60",
      upsert: false,
      contentType: data.mimeType,
    });

    if (error) throw new Error(error.message);

    const { data: publicData } = supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).getPublicUrl(path);
    return { publicUrl: publicData.publicUrl };
  });
